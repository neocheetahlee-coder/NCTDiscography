const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const members = require('./members.json');

app.use(express.json());
module.exports = app;

let allSongs = [];
let songsLoaded = false;
let songLoadPromise = null;

// ==========================================
// DSA 1: HASH TABLE (สำหรับระบบค้นหา)
// ==========================================
class SearchHashTable {
    constructor() {
        this.table = {}; // ใช้ Object เป็น Hash Table
    }

    // ฟังก์ชันสร้าง Index ข้อมูล (แยกคำจากชื่อเพลง, อัลบั้ม, ศิลปิน)
    buildIndex(songs) {
        this.table = {}; 
        songs.forEach(song => {
            // จับเอาคำทั้งหมดมาแยกด้วยช่องว่าง และทำให้เป็นตัวพิมพ์เล็ก
            const words = `${song.trackName} ${song.collectionName} ${song.artistName}`.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (!this.table[word]) {
                    this.table[word] = [];
                }
                // ถ้ายังไม่มีเพลงนี้ใน array ของคำนั้น ให้เพิ่มเข้าไป
                if (!this.table[word].some(s => s.trackId === song.trackId)) {
                    this.table[word].push(song);
                }
            });
        });
    }

    // ฟังก์ชันค้นหา O(1) - O(n)
    search(keyword) {
        const key = keyword.toLowerCase().trim();
        // กรณีพิมพ์คำเป๊ะๆ (O(1))
        if (this.table[key]) return this.table[key];
        
        // กรณีพิมพ์แค่บางส่วน (ต้องวนลูปหา)
        let results = [];
        for (let hashKey in this.table) {
            if (hashKey.includes(key)) {
                results.push(...this.table[hashKey]);
            }
        }
        // ลบข้อมูลซ้ำ
        return [...new Map(results.map(item => [item.trackId, item])).values()];
    }
}
const songDB = new SearchHashTable();

// ==========================================
// DSA 2: SORTING ALGORITHMS
// ==========================================
// เขีInsertion Sort เพื่อจัดเรียงเพลงตามชื่อเพลง (A-Z, Z-A) หรือวันที่วางจำหน่าย (ใหม่สุด, เก่าสุด)
function customSort(arr, type) {
    let result = [...arr];
    for (let i = 1; i < result.length; i++) {
        let current = result[i];
        let j = i - 1;

        if (type === 'az') {
            while (j >= 0 && result[j].trackName.localeCompare(current.trackName) > 0) {
                result[j + 1] = result[j];
                j--;
            }
        } else if (type === 'za') {
            while (j >= 0 && result[j].trackName.localeCompare(current.trackName) < 0) {
                result[j + 1] = result[j];
                j--;
            }
        } else if (type === 'newest') {
            while (j >= 0 && new Date(result[j].releaseDate) < new Date(current.releaseDate)) {
                result[j + 1] = result[j];
                j--;
            }
        } else if (type === 'oldest') {
            while (j >= 0 && new Date(result[j].releaseDate) > new Date(current.releaseDate)) {
                result[j + 1] = result[j];
                j--;
            }
        }
        result[j + 1] = current;
    }
    return result;
}

// ==========================================
// ดึงข้อมูลและจัดการ Routing
// ==========================================
async function fetchAppleMusicData() {
    // Load each NCT unit in its existing store; WISH includes both Thai and Japanese catalogs.
    const responses = await Promise.all([
        fetch('https://itunes.apple.com/search?term=nct+127&entity=song&attribute=artistTerm&limit=200&country=TH'),
        fetch('https://itunes.apple.com/search?term=nct+dream&entity=song&attribute=artistTerm&limit=200&country=TH'),
        fetch('https://itunes.apple.com/search?term=nct+u&entity=song&attribute=artistTerm&limit=200&country=TH'),
        fetch('https://itunes.apple.com/search?term=nct+wish&entity=song&attribute=artistTerm&limit=200&country=TH'),
        fetch('https://itunes.apple.com/search?term=nct+wish&entity=song&attribute=artistTerm&limit=200&country=JP'),
        fetch('https://itunes.apple.com/search?term=wayv&entity=song&attribute=artistTerm&limit=200&country=TH')
    ]);

    for (const response of responses) {
        if (!response.ok) {
            throw new Error(`iTunes Search returned HTTP ${response.status}`);
        }
    }

    const catalogs = await Promise.all(responses.map(response => response.json()));
    if (catalogs.some(catalog => !Array.isArray(catalog.results))) {
        throw new Error('iTunes Search returned an invalid response');
    }

    const combinedResults = catalogs.flatMap(catalog => catalog.results);
    const validSongs = combinedResults.filter(item =>
        item.trackName &&
        item.collectionName &&
        (item.artistName.toUpperCase().includes('NCT') || item.artistName.toUpperCase().includes('WAYV'))
    );

    allSongs = Array.from(new Map(validSongs.map(item => [item.trackId, item])).values());
    songDB.buildIndex(allSongs);
    songsLoaded = true;
    console.log(`✅ โหลดข้อมูลสำเร็จ (${allSongs.length} เพลง จาก 127, DREAM, U, WISH ทั้ง TH และ JP)`);
}

function ensureSongsLoaded() {
    if (songsLoaded) return Promise.resolve();
    if (!songLoadPromise) {
        songLoadPromise = fetchAppleMusicData().catch(error => {
            songLoadPromise = null;
            throw error;
        });
    }
    return songLoadPromise;
}

// Prime the song catalog on the first API call; failures are retried on the next request.
app.use('/api', async (req, res, next) => {
    try {
        await ensureSongsLoaded();
        next();
    } catch (error) {
        console.error('Could not initialize the song catalog:', error);
        res.status(502).json({ error: 'Could not load song data from Apple Music' });
    }
});

// Endpoint ดึงข้อมูลสมาชิก NCT จาก members.json
app.get('/api/members', (req, res) => {
    const { unit } = req.query;
    if (unit && unit !== 'ALL') {
        const filtered = members.filter(m => m.units.some(u => u.toUpperCase() === unit.toUpperCase()));
        return res.json(filtered);
    }
    res.json(members);
});

app.get('/api/members/:id/solo-albums', async (req, res) => {
    const memberId = Number(req.params.id);
    if (!Number.isInteger(memberId)) {
        return res.status(400).json({ error: 'Invalid member ID' });
    }

    try {
        const member = members.find(item => item.id === memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (!member.soloAlbums?.length || !member.appleMusic?.artistId) {
            return res.json({ albums: [] });
        }

        const lookupUrl = new URL('https://itunes.apple.com/lookup');
        lookupUrl.searchParams.set('id', member.appleMusic.artistId);
        lookupUrl.searchParams.set('entity', 'album');
        lookupUrl.searchParams.set('country', 'th');

        const response = await fetch(lookupUrl);
        if (!response.ok) {
            throw new Error(`iTunes Lookup returned HTTP ${response.status}`);
        }

        const catalog = await response.json();
        if (catalog.errorMessage) {
            throw new Error(`iTunes Lookup error: ${catalog.errorMessage}`);
        }

        const normalizeTitle = title => title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const artistName = member.name.toLowerCase();
        const catalogAlbums = (catalog.results || []).filter(item =>
            item.wrapperType === 'collection' &&
            item.artistName?.toLowerCase() === artistName &&
            item.collectionName &&
            item.collectionViewUrl
        );

        const albums = member.soloAlbums.flatMap(album => {
            const expectedTitle = normalizeTitle(album.albumTitle);
            const match = catalogAlbums.find(item => {
                const catalogTitle = normalizeTitle(item.collectionName);
                return catalogTitle === expectedTitle ||
                    catalogTitle.startsWith(expectedTitle) ||
                    expectedTitle.startsWith(catalogTitle);
            });
            if (!match) return [];

            const releaseYear = match.releaseDate
                ? new Date(match.releaseDate).getFullYear()
                : album.releaseYear;
            return [{
                albumTitle: match.collectionName,
                releaseYear: Number.isNaN(releaseYear) ? album.releaseYear : releaseYear,
                titleTrack: album.titleTrack,
                appleMusicUrl: match.collectionViewUrl
            }];
        });

        res.json({ albums });
    } catch (error) {
        console.error(`Error loading solo albums for member ${memberId}:`, error);
        res.status(502).json({ error: 'Could not load solo albums from Apple Music' });
    }
});

// Endpoint ดึงข้อมูล (รองรับการค้นหา จัดเรียง และกรองยูนิต)
app.get('/api/songs', (req, res) => {
    const { unit, sort, search } = req.query;
    let results = allSongs;

    // 1. ค้นหาด้วย Hash Table
    if (search) {
        results = songDB.search(search);
    }

    // 2. กรองตาม Unit
    if (unit && unit !== 'ALL') {
        results = results.filter(song => song.artistName.toUpperCase().includes(unit.toUpperCase()));
    }

    // 3. จัดเรียงด้วยลอจิกที่เขียนเอง (Sorting)
    if (sort) {
        results = customSort(results, sort);
    }

    // จำลองระบบ Top 3 (จำลองโดยการเอา 3 อันดับแรกของผลลัพธ์)
    const top3 = results.slice(0, 3);

    res.json({ top3, songs: results });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 พร้อมใช้งานที่ http://localhost:${PORT}`));
}