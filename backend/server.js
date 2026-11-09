const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const members = require('./members.json');

app.use(express.json());
module.exports = app;

let allSongs = [];
let songsLoaded = false;
let songLoadPromise = null;

// ตารางแฮชสำหรับค้นหาเพลง
class SearchHashTable {
    constructor() {
        this.table = Object.create(null);
        this.trackIdsByWord = Object.create(null);
    }

    // แยกคำจากชื่อเพลง อัลบั้ม และศิลปินเพื่อสร้างดัชนี
    buildIndex(songs) {
        this.table = Object.create(null);
        this.trackIdsByWord = Object.create(null);
        songs.forEach(song => {
            const words = `${song.trackName} ${song.collectionName} ${song.artistName}`.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (!this.table[word]) {
                    this.table[word] = [];
                    this.trackIdsByWord[word] = new Set();
                }
                if (!this.trackIdsByWord[word].has(song.trackId)) {
                    this.table[word].push(song);
                    this.trackIdsByWord[word].add(song.trackId);
                }
            });
        });
    }

    // คำตรงค้นหาได้เฉลี่ย O(1); คำบางส่วนต้องไล่ตรวจทุกคำในดัชนี
    search(keyword) {
        const key = keyword.toLowerCase().trim();
        if (this.table[key]) return this.table[key];
        
        let results = [];
        for (let hashKey in this.table) {
            if (hashKey.includes(key)) {
                results.push(...this.table[hashKey]);
            }
        }
        // คำค้นบางส่วนอาจพบเพลงเดียวกันหลายครั้ง
        return [...new Map(results.map(item => [item.trackId, item])).values()];
    }
}
const songDB = new SearchHashTable();

// Heap Sort ใช้เวลา O(n log n) และพื้นที่ O(n) สำหรับคีย์ที่เตรียมไว้
// อัลกอริทึมไม่ stable จึงใช้ index เดิมรักษาลำดับเมื่อคีย์เท่ากัน
function customSort(arr, type) {
    if (!['az', 'za', 'newest', 'oldest'].includes(type)) {
        return [...arr];
    }

    const isDateSort = type === 'newest' || type === 'oldest';
    const direction = type === 'za' || type === 'newest' ? -1 : 1;
    const collator = isDateSort ? null : new Intl.Collator();
    // เตรียมชื่อหรือ timestamp ล่วงหน้า ไม่แปลงซ้ำระหว่างเปรียบเทียบ
    const keyedSongs = arr.map((song, index) => ({
        song,
        index,
        key: isDateSort
            ? new Date(song.releaseDate).getTime()
            : song.trackName,
    }));

    const compare = (a, b) => {
        if (isDateSort) {
            const aIsValid = Number.isFinite(a.key);
            const bIsValid = Number.isFinite(b.key);
            if (aIsValid !== bIsValid) return aIsValid ? -1 : 1;
            if (aIsValid && a.key !== b.key) return (a.key - b.key) * direction;
        } else {
            const comparison = collator.compare(a.key, b.key) * direction;
            if (comparison !== 0) return comparison;
        }

        return a.index - b.index;
    };

    const siftDown = (heap, root, heapSize) => {
        let current = root;
        while (true) {
            const left = 2 * current + 1;
            const right = left + 1;
            let largest = current;

            if (left < heapSize && compare(heap[left], heap[largest]) > 0) {
                largest = left;
            }
            if (right < heapSize && compare(heap[right], heap[largest]) > 0) {
                largest = right;
            }
            if (largest === current) return;

            [heap[current], heap[largest]] = [heap[largest], heap[current]];
            current = largest;
        }
    };

    // สร้าง max-heap ใช้ O(n) แล้วดึงค่าสูงสุดทีละตัว ใช้ O(log n) ต่อครั้ง
    for (let root = Math.floor(keyedSongs.length / 2) - 1; root >= 0; root--) {
        siftDown(keyedSongs, root, keyedSongs.length);
    }
    for (let end = keyedSongs.length - 1; end > 0; end--) {
        [keyedSongs[0], keyedSongs[end]] = [keyedSongs[end], keyedSongs[0]];
        siftDown(keyedSongs, 0, end);
    }

    return keyedSongs.map(({ song }) => song);
}

// Min-heap แบบ array: push และ pop ใช้เวลา O(log n)
class MinHeap {
    constructor(compare) {
        this.items = [];
        this.compare = compare;
    }

    get size() {
        return this.items.length;
    }

    peek() {
        return this.items[0];
    }

    push(value) {
        this.items.push(value);
        this.siftUp(this.items.length - 1);
    }

    pop() {
        if (this.items.length === 0) return undefined;
        const minimum = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = last;
            this.siftDown(0);
        }
        return minimum;
    }

    siftUp(index) {
        let current = index;
        while (current > 0) {
            const parent = (current - 1) >> 1;
            if (this.compare(this.items[current], this.items[parent]) >= 0) return;
            [this.items[current], this.items[parent]] = [this.items[parent], this.items[current]];
            current = parent;
        }
    }

    siftDown(index) {
        let current = index;
        while (true) {
            const left = 2 * current + 1;
            const right = 2 * current + 2;
            let smallest = current;

            if (left < this.items.length &&
                this.compare(this.items[left], this.items[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.items.length &&
                this.compare(this.items[right], this.items[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === current) return;

            [this.items[current], this.items[smallest]] = [this.items[smallest], this.items[current]];
            current = smallest;
        }
    }
}

function getTopThreeNewestSongs(songs) {
    // เก็บเพียง 3 เพลง: ใช้เวลา O(n log 3) หรือ O(n) และพื้นที่ O(1)
    const compareRank = (a, b) => {
        const aIsValid = Number.isFinite(a.timestamp);
        const bIsValid = Number.isFinite(b.timestamp);
        if (aIsValid !== bIsValid) return aIsValid ? 1 : -1;
        if (aIsValid && a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        return b.index - a.index;
    };
    const newestSongs = new MinHeap(compareRank);

    songs.forEach((song, index) => {
        const entry = {
            song,
            timestamp: new Date(song.releaseDate).getTime(),
            index,
        };
        if (newestSongs.size < 3) {
            newestSongs.push(entry);
        } else if (compareRank(entry, newestSongs.peek()) > 0) {
            newestSongs.pop();
            newestSongs.push(entry);
        }
    });

    const result = [];
    while (newestSongs.size > 0) {
        result.push(newestSongs.pop().song);
    }
    return result.reverse();
}

app.locals.customSort = customSort;

// โหลดแคตตาล็อกจาก iTunes และลงดัชนีค้นหา
async function fetchAppleMusicData() {
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

// โหลดข้อมูลเมื่อมี API request แรก และลองใหม่ได้หากโหลดไม่สำเร็จ
app.use('/api', async (req, res, next) => {
    try {
        await ensureSongsLoaded();
        next();
    } catch (error) {
        console.error('Could not initialize the song catalog:', error);
        res.status(502).json({ error: 'Could not load song data from Apple Music' });
    }
});

// ดึงข้อมูลสมาชิกและกรองตามยูนิต
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

// ค้นหา กรอง และจัดเรียงเพลง โดยคงรูปแบบ response เดิม
app.get('/api/songs', (req, res) => {
    const { unit, sort, search } = req.query;
    let results = allSongs;

    if (search) {
        results = songDB.search(search);
    }

    if (unit && unit !== 'ALL') {
        results = results.filter(song => song.artistName.toUpperCase().includes(unit.toUpperCase()));
    }

    if (sort) {
        results = customSort(results, sort);
    }

    const top3 = getTopThreeNewestSongs(results);

    res.json({ top3, songs: results });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 พร้อมใช้งานที่ http://localhost:${PORT}`));
}