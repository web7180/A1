async function initMap() {
    // 初始化地图，中心点设为布里斯班
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: -27.4698, lng: 153.0251 },
    });

    // 调用后端API获取水道数据
    const waterwayData = await fetchWaterwayData();

    // 遍历水道数据并在地图上绘制
    if (waterwayData && waterwayData.records) {
        waterwayData.records.forEach(record => {
            const coordinates = record.fields.geo_shape.coordinates[0].map(coord => ({
                lat: coord[1],
                lng: coord[0]
            }));

            const waterwayPath = new google.maps.Polyline({
                path: coordinates,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });

            waterwayPath.setMap(map);

            // 添加点击事件，显示水道的详细信息
            waterwayPath.addListener('click', () => {
                new google.maps.InfoWindow({
                    content: `<h3>${record.fields.name || 'Waterway'}</h3><p>Length: ${record.fields.length || 'Unknown'} km</p>`
                }).open(map);
            });
        });
    }
}

// 获取API数据的异步函数
async function fetchWaterwayData() {
    try {
        const response = await axios.get('https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/cp14-waterway-corridors-overlay-waterway-centreline/records?limit=20');
        console.log('Fetched Waterway Data:', response.data); // return the data from API
        return response.data;
    } catch (error) {
        console.error('Error fetching waterway data:', error);
        return null;
    }
}
