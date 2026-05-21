import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  BookOpen, 
  Image as ImageIcon, 
  CloudLightning, 
  CloudRain, 
  CloudSync, 
  RotateCw, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Heart, 
  Sparkles, 
  Sun, 
  Moon, 
  Compass, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import EXIF from 'exif-js';
import './App.css';

// Custom Map Panning Component (React-Leaflet best practice)
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener to capture coordinates for new logs
function MapClickHandler({ isAddingOrEditing, onLocationSelected }) {
  useMapEvents({
    click(e) {
      if (isAddingOrEditing) {
        onLocationSelected(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

const initialEntries = [
  {
    id: '1',
    title: '제주도 푸른 바다 여행',
    locationName: '제주도 성산일출봉',
    date: '2026-04-12',
    content: '성산일출봉 정상에 올라서 끝없이 펼쳐진 동쪽 바다를 감상했다. 불어오는 바람은 살짝 쌀쌀했지만, 해가 떠오르며 하늘을 붉게 물들이는 풍경은 평생 잊지 못할 추억이 될 것이다. 역시 제주도는 언제 와도 힐링이다.',
    lat: 33.4582,
    lng: 126.9425,
    visits: 5,
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=400&q=80',
    region: '제주'
  },
  {
    id: '2',
    title: '서울의 밤을 한눈에',
    locationName: '남산 서울타워',
    date: '2026-05-02',
    content: '대학 동기들과 오래간만에 만나 남산 타워 케이블카를 탔다. 타워 전망대에서 내려다본 서울의 야경은 마치 보석을 흩뿌려 놓은 것처럼 찬란했다. 남산 돈까스를 빼놓을 수 없어서 먹었는데, 옛날 맛 그대로였다.',
    lat: 37.5511,
    lng: 126.9882,
    visits: 8,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80',
    region: '서울'
  },
  {
    id: '3',
    title: '부산 해운대 힐링 밤바다',
    locationName: '부산 해운대 해수욕장',
    date: '2026-03-20',
    content: '업무 스트레스를 해소하기 위해 KTX를 타고 무작정 부산으로 향했다. 밤바다 파도 소리를 들으며 해운대 백사장을 조용히 걷는 것만으로도 무겁던 머리가 맑아졌다. 근처 포장마차에서 맛본 곰장어와 소주 한 잔은 최고의 위로였다.',
    lat: 35.1586,
    lng: 129.1603,
    visits: 4,
    image: 'https://images.unsplash.com/photo-1578351543725-d91f4a9b6c0c?auto=format&fit=crop&w=400&q=80',
    region: '경남/부산'
  },
  {
    id: '4',
    title: '강릉 안목해변 커피거리',
    locationName: '강릉 안목해변',
    date: '2026-02-15',
    content: '따뜻한 라떼 한 잔을 들고 안목해변의 통유리 카페에 앉아 몇 시간 동안 바다를 멍하니 바라봤다. 하얗게 부서지는 파도와 푸른 수평선이 어우러져 한 폭의 그림 같았다. 강릉의 시그니처 순두부 젤라또로 완벽한 마무리.',
    lat: 37.7718,
    lng: 129.0034,
    visits: 3,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    region: '강원'
  },
  {
    id: '5',
    title: '역사와 야경의 하모니',
    locationName: '경주 동궁과 월지',
    date: '2026-01-10',
    content: '경주 야경의 백미라는 동궁과 월지를 해질녘 방문했다. 어둠이 내리고 조명이 켜지자, 신라 시대 전각들이 거울 같은 연못 위로 그대로 투영되어 신비로운 분위기를 연출했다. 왜 수학여행 필수 코스였는지 이제야 제대로 이해했다.',
    lat: 35.8347,
    lng: 129.2266,
    visits: 2,
    image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=400&q=80',
    region: '경북/대구'
  }
];

function App() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('travel_entries');
    return saved ? JSON.parse(saved) : initialEntries;
  });

  const [activeEntryId, setActiveEntryId] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [theme, setTheme] = useState('dark');
  
  // iCloud Simulated Syncing State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLog, setSyncLog] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [showICloudModal, setShowICloudModal] = useState(false);

  // Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    locationName: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    lat: '',
    lng: '',
    visits: 1,
    image: '',
    region: '서울'
  });
  
  const [exifStatus, setExifStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('travel_entries', JSON.stringify(entries));
  }, [entries]);

  // Set Theme on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Calculate high-frequency statistics
  const totalVisits = entries.reduce((acc, curr) => acc + (Number(curr.visits) || 1), 0);
  const maxVisits = Math.max(...entries.map(e => Number(e.visits) || 1), 1);
  const uniqueLocationsCount = entries.length;
  
  // Most Visited Spot
  const favoriteSpot = [...entries].sort((a, b) => (b.visits || 0) - (a.visits || 0))[0];

  // Group visits by region to calculate choropleth data
  const regionsList = ['서울', '경기/인천', '강원', '충청', '전라', '경북/대구', '경남/부산', '제주'];
  const regionStats = regionsList.reduce((acc, region) => {
    acc[region] = entries
      .filter(e => e.region === region)
      .reduce((sum, curr) => sum + (Number(curr.visits) || 1), 0);
    return acc;
  }, {});
  const maxRegionVisits = Math.max(...Object.values(regionStats), 1);

  // Dynamic Center for Map Panning
  const activeEntry = entries.find(e => e.id === activeEntryId);
  const mapCenter = activeEntry ? [activeEntry.lat, activeEntry.lng] : [36.5, 127.8]; // Central Korea
  const mapZoom = activeEntry ? 12 : 7.5;

  // Filter & Search logic
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = filterRegion === 'All' || entry.region === filterRegion;
    
    return matchesSearch && matchesRegion;
  });

  // Dynamic custom HTML/SVG icon factory to bypass Leaflet asset loading issue
  // Colors dynamically shift from sky-blue (low visits) to neon pink/rose (high visits)
  const getCustomMarkerIcon = (visits) => {
    const ratio = Math.min((visits - 1) / (maxVisits - 1 || 1), 1);
    // HSL: 200 (sky-blue) to 330 (deep pink/magenta)
    const hue = 200 + (130 * ratio);
    const color = `hsl(${hue}, 95%, 55%)`;
    // Size increases based on frequency
    const size = 14 + (ratio * 14);
    
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
          <div class="marker-pulse ${visits > 4 ? 'high' : ''}" style="background-color: hsla(${hue}, 95%, 55%, 0.25); width: ${size + 24}px; height: ${size + 24}px; border-radius: 50%; position: absolute;"></div>
          <div class="marker-pin" style="background-color: ${color}; border: 2.5px solid #ffffff; width: ${size}px; height: ${size}px; border-radius: 50%; box-shadow: 0 0 12px hsla(${hue}, 95%, 55%, 0.6);"></div>
        </div>
      `,
      iconSize: [size + 24, size + 24],
      iconAnchor: [(size + 24) / 2, (size + 24) / 2]
    });
  };

  // Convert EXIF Degrees/Minutes/Seconds to Decimal Degrees
  const convertDMSToDD = (dms, ref) => {
    if (!dms || dms.length < 3) return null;
    const deg = typeof dms[0] === 'object' ? dms[0].numerator / dms[0].denominator : dms[0];
    const min = typeof dms[1] === 'object' ? dms[1].numerator / dms[1].denominator : dms[1];
    const sec = typeof dms[2] === 'object' ? dms[2].numerator / dms[2].denominator : dms[2];
    
    let dd = deg + (min / 60) + (sec / 3600);
    if (ref === 'S' || ref === 'W') dd = -dd;
    return dd;
  };

  // Extract location from EXIF tags
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExifStatus({ type: 'loading', message: '사진 메타데이터 분석 중...' });

    // 1. Load preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);

    // 2. Parse EXIF
    EXIF.getData(file, function() {
      const latData = EXIF.getTag(this, 'GPSLatitude');
      const lngData = EXIF.getTag(this, 'GPSLongitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
      const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');
      const dateStr = EXIF.getTag(this, 'DateTimeOriginal');

      let parsedLat = null;
      let parsedLng = null;
      let parsedDate = formData.date;

      if (latData && lngData) {
        parsedLat = convertDMSToDD(latData, latRef);
        parsedLng = convertDMSToDD(lngData, lngRef);
      }

      if (dateStr) {
        // EXIF Date is "YYYY:MM:DD HH:MM:SS" -> convert to "YYYY-MM-DD"
        const parts = dateStr.split(' ')[0].split(':');
        if (parts.length === 3) {
          parsedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
      }

      if (parsedLat && parsedLng) {
        setFormData(prev => ({
          ...prev,
          lat: parsedLat.toFixed(6),
          lng: parsedLng.toFixed(6),
          date: parsedDate
        }));
        setExifStatus({ 
          type: 'success', 
          message: `성공! 촬영 위치 정보 감지: (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}) 및 날짜 자동 입력됨` 
        });
      } else {
        setExifStatus({ 
          type: 'warning', 
          message: '사진에 GPS 메타데이터가 발견되지 않았습니다. 메인 지도를 더블클릭/클릭하시면 촬영 위치를 마크업 하실 수 있습니다.' 
        });
      }
    });
  };

  // Trigger simulated iCloud sync
  const startICloudSync = () => {
    setIsSyncing(true);
    setSyncProgress(5);
    setSyncLog('iCloud 서버 연결 보안 채널(TLS 1.3) 수립 중...');

    const stages = [
      { progress: 20, log: 'FaceID/2차 인증 승인 대기 중...' },
      { progress: 45, log: 'iCloud 포토 라이브러리 GPS 메타데이터 분석 중...' },
      { progress: 70, log: '촬영 위치 인덱싱 및 맵핑 알고리즘 활성화...' },
      { progress: 90, log: '추가 여행 기록 동기화 완료 중...' },
      { progress: 100, log: '동기화 완료! 지도가 동적으로 갱신되었습니다.' }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setSyncProgress(stage.progress);
        setSyncLog(stage.log);
        
        if (stage.progress === 100) {
          setIsSyncing(false);
          setIsCloudSynced(true);
          
          // Seed extra iCloud sync data if they are not already there
          const hasICloudEntries = entries.some(e => e.id === 'icloud-1');
          if (!hasICloudEntries) {
            const iCloudMockEntries = [
              {
                id: 'icloud-1',
                title: '여수 밤바다 낭만 여행',
                locationName: '여수 낭만포차거리',
                date: '2026-05-18',
                content: '[iCloud 자동 동기화] 여수 밤바다 노래를 들으며 해물 삼합을 먹었다. 조명 켜진 돌산대교 야경이 너무 황홀했고 바닷바람을 쐬니 답답하던 마음이 가벼워졌다. 친구들과의 밤새 이어진 수다는 언제나 옳다.',
                lat: 34.7335,
                lng: 127.7478,
                visits: 6,
                image: 'https://images.unsplash.com/photo-1513553404607-988bf2703777?auto=format&fit=crop&w=400&q=80',
                region: '전라'
              },
              {
                id: 'icloud-2',
                title: '춘천 남이섬 가을 단풍',
                locationName: '춘천 남이섬 메타세쿼이아길',
                date: '2025-10-25',
                content: '[iCloud 자동 동기화] 단풍이 흐드러지게 핀 가을 남이섬. 자전거를 대여해서 섬을 한 바퀴 도니 기분이 상쾌해졌다. 메타세쿼이아길 한복판에서 연신 셔터를 누르며 인생샷을 수십 장 건졌다. 닭갈비 점심까지 완벽!',
                lat: 37.8016,
                lng: 127.5255,
                visits: 3,
                image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
                region: '강원'
              }
            ];
            setEntries(prev => [...iCloudMockEntries, ...prev]);
            setActiveEntryId('icloud-1');
          }
        }
      }, (index + 1) * 1200);
    });
  };

  // Form submit handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.locationName || !formData.lat || !formData.lng) {
      alert('제목, 장소명, 위도, 경도는 필수 입력 항목입니다. 지도를 클릭하거나 사진을 올려 감지해보세요!');
      return;
    }

    // Auto-detect region if not customized
    let detectedRegion = formData.region;
    const name = formData.locationName + formData.title;
    if (name.includes('서울')) detectedRegion = '서울';
    else if (name.includes('제주')) detectedRegion = '제주';
    else if (name.includes('부산') || name.includes('해운대') || name.includes('광안리') || name.includes('경남')) detectedRegion = '경남/부산';
    else if (name.includes('경주') || name.includes('대구') || name.includes('경북')) detectedRegion = '경북/대구';
    else if (name.includes('강원') || name.includes('강릉') || name.includes('속초') || name.includes('춘천') || name.includes('양양')) detectedRegion = '강원';
    else if (name.includes('광주') || name.includes('여수') || name.includes('전라') || name.includes('순천')) detectedRegion = '전라';
    else if (name.includes('대전') || name.includes('충청') || name.includes('태안')) detectedRegion = '충청';
    else if (name.includes('경기') || name.includes('인천') || name.includes('수원')) detectedRegion = '경기/인천';

    if (isEditingId) {
      setEntries(prev => prev.map(entry => 
        entry.id === isEditingId 
          ? { 
              ...entry, 
              ...formData, 
              lat: parseFloat(formData.lat), 
              lng: parseFloat(formData.lng), 
              visits: parseInt(formData.visits),
              region: detectedRegion 
            }
          : entry
      ));
      setIsEditingId(null);
    } else {
      const newEntry = {
        id: Date.now().toString(),
        title: formData.title,
        locationName: formData.locationName,
        date: formData.date,
        content: formData.content,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        visits: parseInt(formData.visits) || 1,
        image: formData.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80',
        region: detectedRegion
      };
      setEntries(prev => [newEntry, ...prev]);
      setActiveEntryId(newEntry.id);
    }

    // Reset Form
    setIsAddingNew(false);
    setFormData({
      title: '',
      locationName: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      lat: '',
      lng: '',
      visits: 1,
      image: '',
      region: '서울'
    });
    setExifStatus({ type: '', message: '' });
  };

  const handleEdit = (entry, e) => {
    e.stopPropagation();
    setFormData({
      title: entry.title,
      locationName: entry.locationName,
      date: entry.date,
      content: entry.content,
      lat: entry.lat.toString(),
      lng: entry.lng.toString(),
      visits: entry.visits,
      image: entry.image,
      region: entry.region
    });
    setIsEditingId(entry.id);
    setIsAddingNew(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('이 여행 발자취를 정말 삭제하시겠습니까?')) {
      const remaining = entries.filter(e => e.id !== id);
      setEntries(remaining);
      if (activeEntryId === id && remaining.length > 0) {
        setActiveEntryId(remaining[0].id);
      }
    }
  };

  // Helper to trigger map click setting
  const setCoordsFromMapClick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    }));
    setExifStatus({
      type: 'success',
      message: `지도를 클릭하여 위치가 임시 지정되었습니다: (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    });
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header">
        <div className="logo-section">
          <Compass className="logo-icon" size={32} />
          <h1 className="app-title">나의 여행 발자취 (Travel Trace)</h1>
        </div>
        
        <div className="header-actions">
          {/* iCloud Real-time Sync Indicator */}
          <div 
            className={`icloud-badge ${isCloudSynced ? 'synced' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setShowICloudModal(true)}
          >
            <div className="icloud-dot"></div>
            <span>{isCloudSynced ? 'iCloud 동기화 활성' : 'iCloud 분석기 준비완료'}</span>
            <Info size={14} style={{ marginLeft: 4 }} />
          </div>

          <button 
            className="theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="테마 변경"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* DASHBOARD MAIN GRID */}
      <main className="dashboard-grid">
        
        {/* LEFT COLUMN: UPLOAD, ENTRY ADD & DIARY LIST */}
        <section className="left-column">
          
          {/* simulated icloud sync & automatic photo coordinate fetch */}
          <div className="icloud-sync-widget">
            <div className="sync-header">
              <span className="sync-logo">
                <CloudSync size={20} />
                <span>iPhone iCloud 연동 분석기</span>
              </span>
              <button 
                className="sync-button" 
                onClick={startICloudSync}
                disabled={isSyncing}
              >
                <RotateCw size={14} className={isSyncing ? 'anim-spin' : ''} />
                {isSyncing ? '동기화 중...' : 'iCloud 동기화'}
              </button>
            </div>
            
            {isSyncing && (
              <div className="sync-progress-bar">
                <div className="sync-progress-fill" style={{ width: `${syncProgress}%` }}></div>
              </div>
            )}
            
            <p className="sync-log-text">
              {isSyncing ? syncLog : isCloudSynced ? 'iCloud 사진 데이터 2개 추가 연동 완료.' : '핸드폰 iCloud와 연동해 최신 사진의 촬영 GPS 데이터를 가져옵니다.'}
            </p>
          </div>

          {/* ADD / EDIT DIARY FORM PANEL */}
          {isAddingNew ? (
            <div className="panel-card">
              <h2 className="panel-title">
                <Sparkles size={20} className="color-accent" />
                <span>{isEditingId ? '여정 정보 수정하기' : '새로운 여정 추가하기'}</span>
              </h2>

              <form onSubmit={handleFormSubmit} className="form-grid">
                {/* PHOTO UPLOAD DRAG ZONE */}
                <div 
                  className="upload-zone full-width"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden-file-input" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  {formData.image ? (
                    <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>
                        사진 변경하기
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon-wrapper">
                        <ImageIcon size={26} />
                      </div>
                      <p className="upload-text">iPhone 사진 업로드 & 드래그</p>
                      <p className="upload-subtext">사진 업로드 시 촬영 날짜 및 GPS 위치가 자동 완성됩니다.</p>
                    </>
                  )}
                </div>

                {/* EXIF status warning/success */}
                {exifStatus.message && (
                  <div className={`form-group full-width`} style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: exifStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : exifStatus.type === 'warning' ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: `1px solid ${exifStatus.type === 'success' ? '#10b981' : '#f59e0b'}`,
                    color: exifStatus.type === 'success' ? '#10b981' : '#f59e0b'
                  }}>
                    {exifStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{exifStatus.message}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">여정 제목</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예) 푸른 바다의 해운대!"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">정확한 장소명</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예) 해운대 해수욕장"
                    value={formData.locationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">여정 날짜</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">방문 빈도 (회차)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    value={formData.visits}
                    onChange={(e) => setFormData(prev => ({ ...prev, visits: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">위도 (Latitude)</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="지도를 클릭해 자동 입력"
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">경도 (Longitude)</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-input" 
                    placeholder="지도를 클릭해 자동 입력"
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">여행 일기 및 메모장</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="이 여정에 대한 소중한 추억을 일기처럼 편하게 메모해 보세요..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="form-actions full-width">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsAddingNew(false);
                      setIsEditingId(null);
                      setFormData({
                        title: '',
                        locationName: '',
                        date: new Date().toISOString().split('T')[0],
                        content: '',
                        lat: '',
                        lng: '',
                        visits: 1,
                        image: '',
                        region: '서울'
                      });
                      setExifStatus({ type: '', message: '' });
                    }}
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    여정 기록 저장
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TRAVEL DIARY LIST PANEL */
            <div className="panel-card">
              <div className="entries-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="panel-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <BookOpen size={20} className="color-accent" />
                    <span>추억 메모장 ({filteredEntries.length}개)</span>
                  </h2>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => setIsAddingNew(true)}
                  >
                    <Plus size={14} />
                    <span>추억 추가</span>
                  </button>
                </div>
                
                <div className="search-filter-row">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" size={16} />
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="제목, 내용, 장소명 검색..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className="filter-select"
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                  >
                    <option value="All">전체 지역</option>
                    {regionsList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LIST VIEW */}
              <div className="entries-list">
                {filteredEntries.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    검색 결과와 매칭되는 여정 메모가 없습니다.
                  </div>
                ) : (
                  filteredEntries.map(entry => {
                    const frequencyClass = entry.visits >= 6 ? 'high' : entry.visits >= 3 ? 'medium' : 'low';
                    const frequencyLabel = `방문 ${entry.visits}회`;
                    const isActive = entry.id === activeEntryId;

                    return (
                      <div 
                        key={entry.id} 
                        className={`entry-card ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveEntryId(entry.id);
                        }}
                      >
                        <div className="entry-card-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} />
                            {entry.date}
                          </span>
                          <span className={`frequency-badge ${frequencyClass}`}>
                            <Heart size={10} fill="currentColor" />
                            {frequencyLabel}
                          </span>
                        </div>

                        <div className="entry-card-title-row">
                          <div>
                            <div className="entry-card-title">{entry.title}</div>
                            <div className="entry-card-location">
                              <MapPin size={12} />
                              <span>{entry.locationName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="entry-card-body">
                          {entry.image && (
                            <img 
                              src={entry.image} 
                              alt={entry.title} 
                              className="entry-card-thumbnail" 
                            />
                          )}
                          <p className="entry-card-snippet">{entry.content}</p>
                        </div>

                        <div className="entry-card-footer">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            지역 태그: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{entry.region}</span>
                          </span>
                          <div className="entry-actions">
                            <button 
                              className="action-btn edit-btn"
                              onClick={(e) => handleEdit(entry, e)}
                              title="수정하기"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={(e) => handleDelete(entry.id, e)}
                              title="삭제하기"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* REGIONAL GRADIENT INTENSITY SIDE PANEL */}
          <div className="panel-card">
            <h2 className="panel-title">
              <Sparkles size={20} className="color-accent" />
              <span>지역별 방문 빈도 인덱스</span>
            </h2>
            <div className="frequency-meter-list">
              {regionsList.map(region => {
                const count = regionStats[region] || 0;
                const ratio = Math.min(count / (maxRegionVisits || 1), 1);
                // Heat color based on frequency
                const hue = 200 + (130 * ratio);
                const color = `hsl(${hue}, 95%, 50%)`;
                const percent = Math.round(ratio * 100);

                return (
                  <div key={region} className="frequency-meter-row">
                    <div className="frequency-meter-labels">
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{region}</span>
                      <span style={{ color: color, fontWeight: 600 }}>{count}회 방문 ({percent}%)</span>
                    </div>
                    <div className="frequency-meter-bar-bg">
                      <div 
                        className="frequency-meter-bar-fill" 
                        style={{ 
                          width: `${percent}%`,
                          background: `linear-gradient(90deg, hsl(200, 95%, 55%) 0%, ${color} 100%)`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: MAP DISPLAY & GENERAL STATISTICS */}
        <section className="right-column">
          
          {/* MAP VIEWER COMPONENT CONTAINER */}
          <div className="panel-card map-wrapper" style={{ padding: 0 }}>
            {isAddingNew && (
              <div className="map-title-indicator">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                  <AlertCircle size={14} />
                  지도 위의 임의 위치를 클릭하시면 촬영 위치 좌표가 자동 지정됩니다!
                </span>
              </div>
            )}
            
            <div className="map-controls">
              <button 
                className="map-control-btn"
                onClick={() => {
                  if (activeEntry) {
                    setActiveEntryId(activeEntry.id);
                  } else {
                    setActiveEntryId(entries[0]?.id);
                  }
                }}
              >
                <Compass size={14} />
                <span>여정 중심 맞춤</span>
              </button>
            </div>

            {/* LEAFLET CONTAINER */}
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ width: '100%', height: '100%', minHeight: '520px' }}
              scrollWheelZoom={true}
            >
              {/* Premium Map Theme Tiles */}
              {theme === 'dark' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              )}

              {/* Map Event Listeners */}
              <MapClickHandler 
                isAddingOrEditing={isAddingNew} 
                onLocationSelected={setCoordsFromMapClick} 
              />
              
              {/* Dynamic Camera Pan Controller */}
              <MapViewUpdater center={mapCenter} zoom={mapZoom} />

              {/* OVERLAY HEAT FREQUENCY GRADIENT CLOUDS */}
              {entries.map(entry => {
                const ratio = Math.min((entry.visits - 1) / (maxVisits - 1 || 1), 1);
                const hue = 200 + (130 * ratio);
                const color = `hsl(${hue}, 95%, 55%)`;
                const radius = 5000 + (Math.min(entry.visits, 10) * 4000); // 5km to 45km radius
                const opacity = 0.15 + (ratio * 0.45); // 15% opacity to 60% opacity based on visits

                return (
                  <Circle 
                    key={`circle-${entry.id}`}
                    center={[entry.lat, entry.lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: opacity,
                      color: color,
                      weight: 1.5,
                      dashArray: entry.visits > 4 ? 'none' : '4, 4'
                    }}
                  />
                );
              })}

              {/* DYNAMIC MARKERS WITH FREQUENCY GRADIENT COLORS */}
              {entries.map(entry => (
                <Marker 
                  key={`marker-${entry.id}`}
                  position={[entry.lat, entry.lng]}
                  icon={getCustomMarkerIcon(entry.visits)}
                  eventHandlers={{
                    click: () => {
                      setActiveEntryId(entry.id);
                    }
                  }}
                >
                  <Popup>
                    <div className="map-popup-card">
                      {entry.image && (
                        <img 
                          src={entry.image} 
                          alt={entry.title} 
                          className="map-popup-image" 
                        />
                      )}
                      <h4 className="map-popup-title">{entry.title}</h4>
                      <p className="map-popup-snippet">{entry.content}</p>
                      <div className="map-popup-meta">
                        <span>방문 빈도: {entry.visits}회</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* STATISTICS OVERVIEW BAR */}
          <div className="stats-panel">
            <div className="stat-box">
              <Compass className="stat-icon" size={24} />
              <div className="stat-value">{uniqueLocationsCount}곳</div>
              <div className="stat-label">누적 방문 지역</div>
            </div>
            
            <div className="stat-box">
              <Heart className="stat-icon" size={24} style={{ color: 'var(--accent-secondary)' }} />
              <div className="stat-value">{totalVisits}회</div>
              <div className="stat-label">총 여정 횟수</div>
            </div>

            <div className="stat-box">
              <Sparkles className="stat-icon" size={24} style={{ color: '#10b981' }} />
              <div className="stat-value">{favoriteSpot ? favoriteSpot.locationName.split(' ')[0] : '-'}</div>
              <div className="stat-label">최다 방문지</div>
            </div>

            <div className="stat-box">
              <Calendar className="stat-icon" size={24} style={{ color: '#f59e0b' }} />
              <div className="stat-value">{entries[0]?.date ? entries[0].date.split('-')[1] + '월' : '-'}</div>
              <div className="stat-label">최근 여행 월</div>
            </div>
          </div>

        </section>

      </main>

      {/* EDUCATIONAL DETAILED MODAL FOR iCLOUD CONNECTION */}
      {showICloudModal && (
        <div className="modal-overlay" onClick={() => setShowICloudModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <CloudSync className="color-accent" size={24} />
              <span>iCloud 실시간 연동 기술 설명</span>
            </div>
            
            <div className="modal-body">
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Q. 웹사이트와 아이폰 iCloud가 진짜 바로 실시간 연결되나요?</strong>
              </p>
              <p style={{ marginBottom: '1rem' }}>
                아이폰 <strong>iCloud Photo Library API</strong>는 Apple의 강력한 2단계 보안 인증(2FA), FaceID 보호 및 **유료 Apple Developer Account** 및 **CloudKit JS 라이브러리 연동**이 필수적입니다.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                본 프로젝트는 <strong>가장 실용적이고 우아한 대안</strong>으로 두 가지 핵심 기술을 탑재하여 동일한 사용자 환경을 구현했습니다:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <strong>1. 클라이언트 EXIF 자동 추출:</strong> 아이폰 사진첩에서 웹사이트로 직접 사진을 올리거나 드롭하면, 브라우저가 <code>exif-js</code>로 사진 안의 위도/경도/촬영 시각 메타데이터를 1초 만에 파싱해 위치 정보를 지도에 자동 플로팅합니다!
                </li>
                <li>
                  <strong>2. 시뮬레이티드 iCloud 동기화:</strong> 동기화 버튼 클릭 시 실제 2단계 보안 인증 통신 과정을 모방하여, iCloud 스트림에서 실시간 데이터(여수, 춘천 등)를 분석 및 로딩하는 과정을 구현했습니다.
                </li>
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                이 방식은 유료 애플 개발자 등록 없이도, 수업 과제물 발표에서 <strong>"iCloud 연동 및 EXIF 메타데이터 자동 좌표 맵핑"</strong> 기술을 성공적으로 시연하기 위한 가장 완벽한 설계 모델입니다!
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowICloudModal(false)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                기술 설명 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
