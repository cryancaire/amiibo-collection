// Node.js script to fetch amiibo data and generate SQL insert statements
import fs from 'fs';
import https from 'https';

async function fetchAmiiboData() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.amiiboapi.com/api/amiibo/';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.amiibo || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function escapeString(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function formatDate(dateStr) {
  if (!dateStr) return 'NULL';
  try {
    // AmiiboAPI uses YYYY-MM-DD format
    return "'" + dateStr + "'";
  } catch (error) {
    return 'NULL';
  }
}

async function generateSQL() {
  try {
    console.log('Fetching amiibo data from API...');
    const amiibos = await fetchAmiiboData();
    
    console.log(`Found ${amiibos.length} amiibos`);
    
    let sql = `-- Amiibo data from AmiiboAPI.com
-- Generated on ${new Date().toISOString()}
-- Total amiibos: ${amiibos.length}

-- Clear existing data (optional)
-- DELETE FROM public.amiibos;

-- Insert all amiibo data
INSERT INTO public.amiibos (id, name, character, game_series, amiibo_series, type, image_url, release_date) VALUES\n`;

    const values = amiibos.map(amiibo => {
      // Create unique ID from head+tail
      const id = `${amiibo.head}${amiibo.tail}`;
      const name = escapeString(amiibo.name);
      const character = escapeString(amiibo.character);
      const gameSeries = escapeString(amiibo.gameSeries);
      const amiiboSeries = escapeString(amiibo.amiiboSeries);
      const type = escapeString(amiibo.type);
      const imageUrl = escapeString(amiibo.image);
      const releaseDate = formatDate(amiibo.release?.na || amiibo.release?.eu || amiibo.release?.jp);
      
      return `('${id}', ${name}, ${character}, ${gameSeries}, ${amiiboSeries}, ${type}, ${imageUrl}, ${releaseDate})`;
    });
    
    sql += values.join(',\n');
    sql += ';\n\n';
    
    // Add some helpful queries
    sql += `-- Helpful queries:
-- Count total amiibos
-- SELECT COUNT(*) FROM public.amiibos;

-- Count by type
-- SELECT type, COUNT(*) FROM public.amiibos GROUP BY type ORDER BY COUNT(*) DESC;

-- Count by game series
-- SELECT game_series, COUNT(*) FROM public.amiibos GROUP BY game_series ORDER BY COUNT(*) DESC;

-- Find specific character
-- SELECT * FROM public.amiibos WHERE character ILIKE '%mario%';
`;

    // Write to file
    const filename = 'amiibo-data.sql';
    fs.writeFileSync(filename, sql);
    
    console.log(`✅ SQL file generated: ${filename}`);
    console.log(`📊 Statistics:`);
    
    // Generate statistics
    const typeCount = {};
    const seriesCount = {};
    
    amiibos.forEach(amiibo => {
      typeCount[amiibo.type] = (typeCount[amiibo.type] || 0) + 1;
      seriesCount[amiibo.gameSeries] = (seriesCount[amiibo.gameSeries] || 0) + 1;
    });
    
    console.log(`   Total: ${amiibos.length} amiibos`);
    console.log(`   Types:`, Object.entries(typeCount).map(([k,v]) => `${k}: ${v}`).join(', '));
    console.log(`   Top series:`, Object.entries(seriesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([k,v]) => `${k}: ${v}`)
      .join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
generateSQL();