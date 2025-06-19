const API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';
let currentPage = 0;
let currentObjectIDs = [];
let isLoading = false;
let allArtists = new Set();

document.addEventListener('DOMContentLoaded', function () {
    loadFeaturedArtworks();
    setupEventListeners();
});

function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const artistsLink = document.querySelector('a[href="#artists"]');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    loadMoreBtn.addEventListener('click', loadMoreArtworks);
    
    if (artistsLink) {
        artistsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showArtistsSection();
        });
    }
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    showLoading(true);
    currentPage = 0;

    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&hasImages=true`);
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            currentObjectIDs = data.objectIDs;
            await loadArtworks(true);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

async function searchCategory(category) {
    document.getElementById('searchInput').value = category;
    await performSearch();
}

async function loadArtworks(isNewSearch = false) {
    if (isLoading) return;
    isLoading = true;

    const startIndex = currentPage * 12;
    const endIndex = Math.min(startIndex + 12, currentObjectIDs.length);
    const objectIDsToLoad = currentObjectIDs.slice(startIndex, endIndex);

    if (isNewSearch) {
        document.getElementById('artGrid').innerHTML = '';
    }

    const artworksPromises = objectIDsToLoad.map(id => fetchArtworkDetails(id));
    const artworks = await Promise.all(artworksPromises);
    const validArtworks = artworks.filter(artwork => artwork && artwork.primaryImage);

    displayArtworks(validArtworks, isNewSearch);

    currentPage++;

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (endIndex < currentObjectIDs.length) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }

    document.getElementById('results').classList.remove('hidden');

    document.getElementById('artists-section')?.classList.add('hidden');

    isLoading = false;
}

async function loadMoreArtworks() {
    showLoading(true);
    await loadArtworks(false);
    showLoading(false);
}

async function fetchArtworkDetails(objectID) {
    try {
        const response = await fetch(`${API_BASE}/objects/${objectID}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching artwork ${objectID}:`, error);
        return null;
    }
}

function displayArtworks(artworks, isNewSearch = false) {
    const grid = document.getElementById('artGrid');

    artworks.forEach((artwork, index) => {
        const card = createArtworkCard(artwork);
        grid.appendChild(card);

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'art-card glass-effect rounded-lg overflow-hidden opacity-0 transform translate-y-4 transition-all duration-500';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    const imageUrl = artwork.primaryImageSmall || artwork.primaryImage || 'https://via.placeholder.com/300x400?text=No+Image';
    const title = artwork.title || 'Sin título';
    const artist = artwork.artistDisplayName || 'Artista desconocido';
    const date = artwork.objectDate || 'Fecha desconocida';
    const culture = artwork.culture || '';
    const medium = artwork.medium || '';

    card.innerHTML = `
                <div class="relative group">
                    <img 
                        src="${imageUrl}" 
                        alt="${title}"
                        class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                        onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'"
                    >
                   
                </div>
                <div class="p-6">
                    <h4 class="text-lg font-semibold text-white mb-2 line-clamp-2">${title}</h4>
                    <p class="text-amber-200 text-sm mb-1">${artist}</p>
                    <p class="text-gray-300 text-xs">${date}</p>
                    <button 
                        onclick="showArtworkDetails(${artwork.objectID})"
                        class="mt-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full text-sm hover:from-slate-700 hover:to-slate-800 transition-all transform hover:scale-105"
                    >
                        Ver Detalles
                    </button>
                </div>
            `;

    return card;
}

async function showArtistsSection() {
    document.getElementById('results').classList.add('hidden');

    let artistsSection = document.getElementById('artists-section');
    if (!artistsSection) {
        artistsSection = createArtistsSection();
        document.querySelector('main').appendChild(artistsSection);
    }
    
    artistsSection.classList.remove('hidden');
    
    artistsSection.scrollIntoView({ behavior: 'smooth' });
    
    if (allArtists.size === 0) {
        await loadAllArtists();
    } else {
        displayArtists(Array.from(allArtists).sort());
    }
}

function createArtistsSection() {
    const section = document.createElement('section');
    section.id = 'artists-section';
    section.className = 'container mx-auto px-4 py-16';
    section.innerHTML = `
        <h3 class="text-4xl font-bold text-white text-center mb-12 font-['Playfair_Display']">
            Artistas en la Colección
        </h3>
        <div class="text-center mb-8">
            <input 
                type="text" 
                id="artistSearchInput" 
                placeholder="Buscar artista..." 
                class="glass-effect px-6 py-3 rounded-full text-white placeholder-gray-300 outline-none max-w-md"
                style="background: rgba(255, 255, 255, 0.1);"
            >
        </div>
        <div id="artistsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Artists will be loaded here -->
        </div>
        <div class="text-center mt-8">
            <button 
                id="loadMoreArtistsBtn" 
                class="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-4 rounded-full hover:from-slate-700 hover:to-slate-800 transition-all transform hover:scale-105 hidden"
            >
                Cargar Más Artistas
            </button>
        </div>
    `;
    
    setTimeout(() => {
        const artistSearchInput = document.getElementById('artistSearchInput');
        if (artistSearchInput) {
            artistSearchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                filterArtists(query);
            });
        }
    }, 100);
    
    return section;
}

async function loadAllArtists() {
    showLoading(true);
    
    try {
        const departments = [
            { id: 11, name: "European Paintings" },
            { id: 1, name: "American Wing" },
            { id: 6, name: "Asian Art" },
            { id: 10, name: "Egyptian Art" },
            { id: 14, name: "Arms and Armor" },
            { id: 21, name: "Modern Art" }
        ];
        
        const artistsSet = new Set();
        
        for (const dept of departments) {
            try {
                const response = await fetch(`${API_BASE}/search?departmentId=${dept.id}&hasImages=true`);
                const data = await response.json();
                
                if (data.objectIDs && data.objectIDs.length > 0) {
                    const sampleSize = Math.min(100, data.objectIDs.length);
                    const sampleIds = data.objectIDs.slice(0, sampleSize);
                    
                    for (let i = 0; i < sampleIds.length; i += 10) {
                        const batch = sampleIds.slice(i, i + 10);
                        const artworkPromises = batch.map(id => fetchArtworkDetails(id));
                        const artworks = await Promise.all(artworkPromises);
                        
                        artworks.forEach(artwork => {
                            if (artwork && artwork.artistDisplayName && artwork.artistDisplayName !== '') {
                                artistsSet.add(artwork.artistDisplayName);
                            }
                        });
                        
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            } catch (error) {
                console.log(`Error loading department ${dept.name}:`, error);
            }
        }
        
        const famousTerms = ['Monet', 'Van Gogh', 'Picasso', 'Rembrandt', 'Degas', 'Renoir', 'Cézanne', 'Rodin'];
        
        for (const term of famousTerms) {
            try {
                const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(term)}&hasImages=true`);
                const data = await response.json();
                
                if (data.objectIDs && data.objectIDs.length > 0) {
                    const sampleIds = data.objectIDs.slice(0, 20);
                    const artworkPromises = sampleIds.map(id => fetchArtworkDetails(id));
                    const artworks = await Promise.all(artworkPromises);
                    
                    artworks.forEach(artwork => {
                        if (artwork && artwork.artistDisplayName && artwork.artistDisplayName !== '') {
                            artistsSet.add(artwork.artistDisplayName);
                        }
                    });
                }
            } catch (error) {
                console.log(`Error searching for ${term}:`, error);
            }
        }
        
        allArtists = artistsSet;
        const sortedArtists = Array.from(allArtists).sort();
        displayArtists(sortedArtists);
        
    } catch (error) {
        console.error('Error loading artists:', error);
        showArtistsError();
    } finally {
        showLoading(false);
    }
}

function displayArtists(artists) {
    const grid = document.getElementById('artistsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (artists.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="glass-effect rounded-lg p-8 max-w-md mx-auto">
                    <h4 class="text-2xl font-bold text-white mb-4">No se encontraron artistas</h4>
                    <p class="text-gray-300">Intenta con otros términos de búsqueda</p>
                </div>
            </div>
        `;
        return;
    }
    
    artists.forEach((artist, index) => {
        const card = createArtistCard(artist);
        grid.appendChild(card);

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function createArtistCard(artistName) {
    const card = document.createElement('div');
    card.className = 'artist-card glass-effect rounded-lg p-6 opacity-0 transform translate-y-4 transition-all duration-500 hover:scale-105 cursor-pointer';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    card.innerHTML = `
        <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl font-bold text-white">${artistName.charAt(0)}</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">${artistName}</h4>
            <button 
                onclick="searchArtistWorks('${artistName.replace(/'/g, "\\'")}')"
                class="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full text-sm hover:from-slate-700 hover:to-slate-800 transition-all transform hover:scale-105"
            >
                Ver Obras
            </button>
        </div>
    `;
    
    return card;
}

function filterArtists(query) {
    const allArtistsArray = Array.from(allArtists);
    const filteredArtists = allArtistsArray.filter(artist => 
        artist.toLowerCase().includes(query)
    ).sort();
    
    displayArtists(filteredArtists);
}

async function searchArtistWorks(artistName) {

    document.getElementById('artists-section')?.classList.add('hidden');
    
    showLoading(true);
    currentPage = 0;

    try {

        let allObjectIDs = new Set();
        
        try {
            const response1 = await fetch(`${API_BASE}/search?q=${encodeURIComponent(artistName)}&hasImages=true`);
            const data1 = await response1.json();
            if (data1.objectIDs) {
                data1.objectIDs.forEach(id => allObjectIDs.add(id));
            }
        } catch (error) {
            console.log('Error en búsqueda directa:', error);
        }

        const artistWords = artistName.split(' ').filter(word => word.length > 2);
        for (const word of artistWords) {
            try {
                const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(word)}&hasImages=true`);
                const data = await response.json();
                if (data.objectIDs) {
                    data.objectIDs.slice(0, 100).forEach(id => allObjectIDs.add(id));
                }
            } catch (error) {
                console.log(`Error buscando por palabra ${word}:`, error);
            }
        }

        const objectIDsToCheck = Array.from(allObjectIDs);
        
        if (objectIDsToCheck.length === 0) {
            showNoArtistResults(artistName);
            return;
        }

        const filteredObjectIDs = await filterArtworksByArtist(objectIDsToCheck, artistName);
        
        if (filteredObjectIDs.length > 0) {
            currentObjectIDs = filteredObjectIDs;
            await loadArtworks(true);
            
            const resultsTitle = document.querySelector('#results h3');
            if (resultsTitle) {
                resultsTitle.textContent = `Obras de ${artistName}`;
            }
        } else {
            showNoArtistResults(artistName);
        }
        
    } catch (error) {
        console.error('Error searching artist works:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

async function filterArtworksByArtist(objectIDs, targetArtist) {
    const filteredIDs = [];
    const batchSize = 20;
    
    const normalizedTarget = normalizeArtistName(targetArtist);
    
    for (let i = 0; i < objectIDs.length; i += batchSize) {
        const batch = objectIDs.slice(i, i + batchSize);
        
        const artworkPromises = batch.map(async (id) => {
            try {
                const artwork = await fetchArtworkDetails(id);
                if (artwork && artwork.primaryImage && artwork.artistDisplayName) {
                    const normalizedArtwork = normalizeArtistName(artwork.artistDisplayName);
                    
                    if (isArtistMatch(normalizedTarget, normalizedArtwork)) {
                        return id;
                    }
                }
                return null;
            } catch (error) {
                return null;
            }
        });
        
        const results = await Promise.all(artworkPromises);
        const validIDs = results.filter(id => id !== null);
        filteredIDs.push(...validIDs);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (filteredIDs.length >= 50) {
            break;
        }
    }
    
    return filteredIDs;
}

function normalizeArtistName(name) {
    return name
        .toLowerCase()
        .replace(/[^\w\s]/g, '') 
        .replace(/\s+/g, ' ')  
        .trim();
}

function isArtistMatch(target, candidate) {

    if (target === candidate) {
        return true;
    }
    
    const targetWords = target.split(' ').filter(word => word.length > 1);
    const candidateWords = candidate.split(' ');
    
    const matchingWords = targetWords.filter(word => 
        candidateWords.some(cWord => cWord.includes(word) || word.includes(cWord))
    );
    
    return matchingWords.length >= Math.ceil(targetWords.length * 0.7);
}

function showNoArtistResults(artistName) {
    const grid = document.getElementById('artGrid');
    grid.innerHTML = `
        <div class="col-span-full text-center py-16">
            <div class="glass-effect rounded-lg p-8 max-w-md mx-auto">
                <h3 class="text-2xl font-bold text-white mb-4">No se encontraron obras</h3>
                <p class="text-gray-300 mb-4">No se encontraron obras con imágenes de <strong>${artistName}</strong> en la colección disponible.</p>
                <p class="text-gray-400 text-sm">Esto puede deberse a que las obras del artista no tienen imágenes disponibles o están en colecciones privadas.</p>
                <button 
                    onclick="showArtistsSection()" 
                    class="mt-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-2 rounded-full hover:from-slate-700 hover:to-slate-800 transition-all"
                >
                    Volver a Artistas
                </button>
            </div>
        </div>
    `;
    document.getElementById('results').classList.remove('hidden');
    
    const resultsTitle = document.querySelector('#results h3');
    if (resultsTitle) {
        resultsTitle.textContent = `Búsqueda: ${artistName}`;
    }
}

function showArtistsError() {
    const grid = document.getElementById('artistsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="glass-effect rounded-lg p-8 max-w-md mx-auto">
                    <h4 class="text-2xl font-bold text-white mb-4">Error al cargar artistas</h4>
                    <p class="text-gray-300">No se pudieron cargar los artistas. Intenta más tarde.</p>
                    <button 
                        onclick="loadAllArtists()" 
                        class="mt-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-2 rounded-full hover:from-slate-700 hover:to-slate-800 transition-all"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

async function loadFeaturedArtworks() {
    try {
        const masterpieces = [
            436532, 
            459055, 
            438817,
            436105,
            437853, 
            459080, 
            436947, 
            437312, 
            438821, 
            436535  
        ];

        const famousSearchTerms = [
            "Monet Water Lilies",
            "Van Gogh Wheat Field",
            "Picasso",
            "Rodin Thinker",
            "Egyptian sphinx",
            "Greek statue",
            "Renaissance painting",
            "American wing highlights"
        ];

        let featuredArtworks = [];

        const masterpiecePromises = masterpieces.slice(0, 6).map(async (id) => {
            try {
                const artwork = await fetchArtworkDetails(id);
                return artwork && artwork.primaryImage ? artwork : null;
            } catch (error) {
                console.log(`No se pudo cargar la obra ${id}`);
                return null;
            }
        });

        const loadedMasterpieces = await Promise.all(masterpiecePromises);
        featuredArtworks = loadedMasterpieces.filter(artwork => artwork !== null);

        if (featuredArtworks.length < 6) {
            const remainingSlots = 6 - featuredArtworks.length;
            
            for (let i = 0; i < Math.min(remainingSlots, famousSearchTerms.length); i++) {
                try {
                    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(famousSearchTerms[i])}&hasImages=true`);
                    const data = await response.json();
                    
                    if (data.objectIDs && data.objectIDs.length > 0) {
                        const selectedId = data.objectIDs[0];
                        const artwork = await fetchArtworkDetails(selectedId);
                        
                        if (artwork && artwork.primaryImage && 
                            !featuredArtworks.some(existing => existing.objectID === artwork.objectID)) {
                            featuredArtworks.push(artwork);
                        }
                    }
                } catch (error) {
                    console.log(`Error buscando ${famousSearchTerms[i]}`);
                }
            }
        }

        if (featuredArtworks.length < 6) {
            const highlightDepartments = [
                { id: 11, name: "European Paintings" },
                { id: 1, name: "American Wing" },
                { id: 6, name: "Asian Art" },
                { id: 10, name: "Egyptian Art" }
            ];

            for (const dept of highlightDepartments) {
                if (featuredArtworks.length >= 6) break;

                try {
                    const response = await fetch(`${API_BASE}/search?departmentId=${dept.id}&hasImages=true`);
                    const data = await response.json();
                    
                    if (data.objectIDs && data.objectIDs.length > 0) {
                        // Tomar una de las primeras obras del departamento
                        const selectedId = data.objectIDs[Math.floor(Math.random() * Math.min(10, data.objectIDs.length))];
                        const artwork = await fetchArtworkDetails(selectedId);
                        
                        if (artwork && artwork.primaryImage && 
                            !featuredArtworks.some(existing => existing.objectID === artwork.objectID)) {
                            featuredArtworks.push(artwork);
                        }
                    }
                } catch (error) {
                    console.log(`Error cargando departamento ${dept.name}`);
                }
            }
        }

        const finalFeatured = featuredArtworks.slice(0, 6);
        displayFeaturedArtworks(finalFeatured);

    } catch (error) {
        console.error('Error loading featured artworks:', error);
        displayFeaturedError();
    }
}

function displayFeaturedError() {
    const grid = document.getElementById('featuredGrid');
    grid.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="glass-effect rounded-lg p-6 max-w-md mx-auto">
                <h4 class="text-xl font-semibold text-white mb-2">Obras destacadas temporalmente no disponibles</h4>
                <p class="text-gray-300 text-sm">Intenta recargar la página en unos momentos</p>
            </div>
        </div>
    `;
}

function displayFeaturedArtworks(artworks) {
    const grid = document.getElementById('featuredGrid');
    grid.innerHTML = '';

    artworks.forEach((artwork, index) => {
        if (artwork) {
            const card = createArtworkCard(artwork);
            grid.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        }
    });
}

function showArtworkDetails(objectID) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
                <div class="glass-effect rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-bold text-white">Cargando detalles...</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 text-2xl">&times;</button>
                        </div>
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);

    fetchArtworkDetails(objectID).then(artwork => {
        if (artwork) {
            const imageUrl = artwork.primaryImage || 'https://via.placeholder.com/600x400?text=No+Image';
            modal.querySelector('.glass-effect').innerHTML = `
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-2xl font-bold text-white">${artwork.title || 'Sin título'}</h3>
                                <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-red-400 text-2xl">&times;</button>
                            </div>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <img src="${imageUrl}" alt="${artwork.title}" class="w-full rounded-lg">
                                </div>
                                <div class="text-white">
                                    <div class="space-y-3">
                                        <div><strong class="text-amber-200">Artista:</strong> ${artwork.artistDisplayName || 'Desconocido'}</div>
                                        <div><strong class="text-amber-200">Fecha:</strong> ${artwork.objectDate || 'Desconocida'}</div>
                                        <div><strong class="text-amber-200">Cultura:</strong> ${artwork.culture || 'No especificada'}</div>
                                        <div><strong class="text-amber-200">Medio:</strong> ${artwork.medium || 'No especificado'}</div>
                                        <div><strong class="text-amber-200">Dimensiones:</strong> ${artwork.dimensions || 'No especificadas'}</div>
                                        <div><strong class="text-amber-200">Departamento:</strong> ${artwork.department || 'No especificado'}</div>
                                        ${artwork.objectWikidata_URL ? `<div><a href="${artwork.objectWikidata_URL}" target="_blank" class="text-slate-400 hover:text-slate-300">Ver en Wikidata</a></div>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        }
    });
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showNoResults() {
    const grid = document.getElementById('artGrid');
    grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="glass-effect rounded-lg p-8 max-w-md mx-auto">
                        <h3 class="text-2xl font-bold text-white mb-4">No se encontraron resultados</h3>
                        <p class="text-gray-300">Intenta con otros términos de búsqueda</p>
                    </div>
                </div>
            `;
    document.getElementById('results').classList.remove('hidden');
}

function showError() {
    const grid = document.getElementById('artGrid');
    grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="glass-effect rounded-lg p-8 max-w-md mx-auto">
                        <h3 class="text-2xl font-bold text-white mb-4">Error de conexión</h3>
                        <p class="text-gray-300">No se pudo conectar con la API. Intenta más tarde.</p>
                    </div>
                </div>
            `;
    document.getElementById('results').classList.remove('hidden');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});
