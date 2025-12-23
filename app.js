// ===== Thai Address Auto-fill Application =====
// Learning Demo for Junior Developers
// ==============================================

// ===== GLOBAL STATE =====
let geographyData = [];      // All geography data from JSON
let selectedZipData = [];    // Filtered data by zip code
let isManualMode = false;    // Track if user is manually editing
let currentLang = 'th';      // 'th' or 'en'

// UI Labels Dictionary
const uiLabels = {
    headerTitle: { th: 'แก้ไขที่อยู่', en: 'Edit Address' },
    zipLabel: { th: 'รหัสไปรษณีย์', en: 'Postal Code' },
    zipPlaceholder: { th: 'กรอกรหัสไปรษณีย์', en: 'Enter Postal Code' },
    zipError: { th: 'กรุณากรอกรหัสไปรษณีย์', en: 'Please enter postal code' },
    provinceLabel: { th: 'จังหวัด', en: 'Province' },
    provincePlaceholder: { th: 'เลือกจังหวัด', en: 'Select Province' },
    provinceError: { th: 'กรุณาเลือกจังหวัด', en: 'Please select province' },
    districtLabel: { th: 'เขต/อำเภอ', en: 'District' },
    districtPlaceholder: { th: 'เลือกเขต/อำเภอ', en: 'Select District' },
    districtError: { th: 'กรุณาเลือกเขต/อำเภอ', en: 'Please select district' },
    subdistrictLabel: { th: 'แขวง/ตำบล', en: 'Subdistrict' },
    subdistrictPlaceholder: { th: 'เลือกแขวง/ตำบล', en: 'Select Subdistrict' },
    subdistrictError: { th: 'กรุณาเลือกแขวง/ตำบล', en: 'Please select subdistrict' },
    houseNoLabel: { th: 'บ้านเลขที่', en: 'House No.' },
    houseNoPlaceholder: { th: 'กรอกบ้านเลขที่', en: 'Enter House No.' },
    houseNoError: { th: 'กรุณากรอกบ้านเลขที่', en: 'Please enter house no.' },
    mooLabel: { th: 'หมู่', en: 'Village No.' },
    mooPlaceholder: { th: 'กรอกหมู่', en: 'Enter Village No.' },
    soiLabel: { th: 'ซอย', en: 'Soi' },
    soiPlaceholder: { th: 'กรอกซอย', en: 'Enter Soi' },
    buildingLabel: { th: 'หมู่บ้าน / อาคาร', en: 'Village / Building' },
    buildingPlaceholder: { th: 'กรอกหมู่บ้าน/อาคาร', en: 'Enter Village / Building' },
    streetLabel: { th: 'ถนน', en: 'Road' },
    streetPlaceholder: { th: 'กรอกถนน', en: 'Enter Road' },
    submitBtn: { th: 'ดำเนินการต่อ', en: 'Continue' },
    modalTitle: { th: '📍 ยืนยันที่อยู่จัดส่งเอกสาร', en: '📍 Confirm Delivery Address' },
    modalAddressLabel: { th: 'ที่อยู่', en: 'Address' },
    confirmBtn: { th: 'ยืนยัน', en: 'Confirm' },
    cancelBtn: { th: 'ยกเลิก', en: 'Cancel' }
};

// ===== DOM ELEMENTS =====
const zipCodeInput = document.getElementById('zipCode');
const clearZipBtn = document.getElementById('clearZip');
const zipSuggestions = document.getElementById('zipSuggestions');
const provinceSelect = document.getElementById('province');
const districtSelect = document.getElementById('district');
const subdistrictSelect = document.getElementById('subdistrict');
const addressForm = document.getElementById('addressForm');
const modalOverlay = document.getElementById('modalOverlay');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmAddress = document.getElementById('confirmAddress');
const langToggle = document.getElementById('langToggle');

// Debug Panel Elements
const eventLog = document.getElementById('eventLog');
const outputPreview = document.getElementById('outputPreview');

// Variable Watch Elements
const varManualMode = document.getElementById('varManualMode');
const varLang = document.getElementById('varLang');
const varZipDataLen = document.getElementById('varZipDataLen');
const varProvince = document.getElementById('varProvince');
const varDistrict = document.getElementById('varDistrict');

// Performance Metric Elements
const metricRender = document.getElementById('metricRender');
const metricFilter = document.getElementById('metricFilter');

// ===== LANGUAGE FUNCTIONS =====
function toggleLanguage() {
    currentLang = currentLang === 'th' ? 'en' : 'th';
    log(`🌐 Language switched to: ${currentLang.toUpperCase()}`, 'action');
    
    // Update button UI
    const langTexts = langToggle.querySelectorAll('.lang-text');
    langTexts.forEach(span => {
        span.classList.toggle('active', span.textContent === currentLang.toUpperCase());
    });
    
    updateUILabels();
    
    // Refresh Dropdowns with new language
    // We save current selection to restore it if possible
    const currentProv = provinceSelect.value;
    const currentDist = districtSelect.value;
    const currentSub = subdistrictSelect.value;
    
    // Re-populate using active data source
    // Note: This reuse logic will automatically pick correct language based on currentLang global
    const dataSource = getActiveDataSource();
    
    // Repopulate Province
    const provinces = getUniqueProvinces(dataSource);
    populateProvinces(provinces);
    provinceSelect.value = currentProv;
    
    // Repopulate District (if province selected)
    if (currentProv) {
        const districts = getDistrictsByProvince(dataSource, currentProv);
        populateDistricts(districts);
        districtSelect.value = currentDist;
    } else {
         districtSelect.innerHTML = `<option value="">${uiLabels.districtPlaceholder[currentLang]}</option>`;
    }
    
    // Repopulate Subdistrict (if district selected)
    if (currentDist) {
        const subdistricts = getSubdistrictsByDistrict(dataSource, currentDist);
        populateSubdistricts(subdistricts);
        subdistrictSelect.value = currentSub;
    } else {
        subdistrictSelect.innerHTML = `<option value="">${uiLabels.subdistrictPlaceholder[currentLang]}</option>`;
    }
    
    updateState();
    updateOutputPreview();
}

function updateUILabels() {
    // Header
    document.querySelector('.header-title').textContent = uiLabels.headerTitle[currentLang];
    
    // Labels & Placeholders
    // Helper to update label and placeholder/error
    const setField = (id, key) => {
        // Label
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
            const req = label.querySelector('.required') ? '<span class="required">*</span>' : '';
            label.innerHTML = `${uiLabels[key + 'Label'][currentLang]}${req}`;
        }
        
        // Input/Select placeholder (for inputs) or default option (for selects)
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.placeholder = uiLabels[key + 'Placeholder'][currentLang];
            } else if (element.tagName === 'SELECT') {
                // Update first option text
                if (element.options.length > 0 && element.options[0].value === "") {
                    element.options[0].textContent = uiLabels[key + 'Placeholder'][currentLang];
                }
            }
        }
        
        // Error message
        const group = document.getElementById(id + (id === 'zipCode' ? 'Group' : '') + (id === 'houseNo' ? 'Group' : ''));
        if (!group && ['province','district','subdistrict'].includes(id)) {
             // dropdown groups logic (provinceGroup etc.)
             const g = document.getElementById(id + 'Group');
             if(g) g.querySelector('.error-message').textContent = uiLabels[key + 'Error'][currentLang];
        } else if (group) {
             const err = group.querySelector('.error-message');
             if(err) err.textContent = uiLabels[key + 'Error'][currentLang];
        }
    };
    
    setField('zipCode', 'zip');
    setField('province', 'province');
    setField('district', 'district');
    setField('subdistrict', 'subdistrict');
    setField('houseNo', 'houseNo');
    setField('moo', 'moo');
    setField('soi', 'soi');
    setField('buildingName', 'building');
    setField('streetName', 'street');
    
    document.querySelector('.submit-btn').textContent = uiLabels.submitBtn[currentLang];
    
    // Modal
    document.querySelector('.modal-title').textContent = uiLabels.modalTitle[currentLang];
    document.querySelector('.address-label').textContent = uiLabels.modalAddressLabel[currentLang];
    confirmBtn.textContent = uiLabels.confirmBtn[currentLang];
    cancelBtn.textContent = uiLabels.cancelBtn[currentLang];
}

// ===== LOGGING FUNCTIONS (For Debug Panel) =====
function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timeStr = new Date().toLocaleTimeString('en-GB');
    entry.innerHTML = `<span class="log-time">${timeStr}</span> ${message}`;
    eventLog.appendChild(entry);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // Keep only last 50 entries
    while (eventLog.children.length > 50) {
        eventLog.removeChild(eventLog.firstChild);
    }
}

/**
 * Validate Thai zip code format
 * Thai postal codes: 5 digits, starting with 1-9 (e.g., 10100, 50200)
 */
function validateZipFormat(zip) {
    const pattern = /^[1-9]\d{4}$/;
    return pattern.test(zip);
}

/**
 * Update Debug Panel - Variable Watch section
 */
function updateDebugPanel() {
    if (varManualMode) varManualMode.textContent = isManualMode ? 'true' : 'false';
    if (varLang) varLang.textContent = `"${currentLang}"`;
    if (varZipDataLen) varZipDataLen.textContent = selectedZipData.length;
    if (varProvince) varProvince.textContent = provinceSelect.value || 'null';
    if (varDistrict) varDistrict.textContent = districtSelect.value || 'null';
}

function updateState() {
    // Update Debug Panel
    updateDebugPanel();
}

function updateOutputPreview() {
    const data = getFormData();
    outputPreview.textContent = JSON.stringify(data, null, 2);
}

// Highlight active pseudo code line
function highlightCode(lineId) {
    // Remove all active highlights
    document.querySelectorAll('.pseudo-code .code-line').forEach(line => {
        line.classList.remove('active');
    });
    // Add highlight to specified line
    const targetLine = document.querySelector(`.code-line[data-line="${lineId}"]`);
    if (targetLine) {
        targetLine.classList.add('active');
    }
}

// ===== DATA LOADING =====
async function loadGeographyData() {
    log('📥 Loading geography.json...', 'action');
    
    // Show loading indicator on form fields
    const loadingMsg = 'กำลังโหลดข้อมูล...';
    provinceSelect.innerHTML = `<option value="">${loadingMsg}</option>`;
    districtSelect.innerHTML = `<option value="">${loadingMsg}</option>`;
    subdistrictSelect.innerHTML = `<option value="">${loadingMsg}</option>`;
    
    try {
        const response = await fetch('geography.json');
        if (!response.ok) throw new Error('Failed to load data');
        
        // Parse JSON in chunks to avoid blocking main thread
        const text = await response.text();
        
        // Use setTimeout to let the UI breathe
        await new Promise(resolve => setTimeout(resolve, 10));
        
        geographyData = JSON.parse(text);
        
        log(`✅ Loaded ${geographyData.length} geography records`, 'action');
        
        // Initialize all provinces for when user wants to manually select
        initializeAllProvinces();
        updateState();
        
    } catch (error) {
        log(`❌ Error loading data: ${error.message}`, 'error');
        console.error('Error loading geography data:', error);
        
        // Reset dropdowns on error
        provinceSelect.innerHTML = '<option value="">เลือกจังหวัด</option>';
        districtSelect.innerHTML = '<option value="">เลือกเขต/อำเภอ</option>';
        subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
    }
}

// ===== INITIALIZE ALL PROVINCES =====
function initializeAllProvinces() {
    // 1. Load only provinces (Fast)
    const provinces = getUniqueProvinces(geographyData);
    populateProvinces(provinces);
    
    // 2. Enable ONLY province selection
    provinceSelect.disabled = false;
    
    // 3. Reset and disable dependent dropdowns
    districtSelect.innerHTML = '<option value="">เลือกเขต/อำเภอ</option>';
    districtSelect.disabled = true;
    
    subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
    subdistrictSelect.disabled = true;
}

// ===== ZIP CODE FUNCTIONS =====

/**
 * Search for zip codes that start with the query
 * @param {string} query - User input
 * @returns {Array} - Matching zip code results
 */
function searchZipCodes(query) {
    if (!query || query.length === 0) return [];
    
    const results = [];
    const seen = new Set();
    
    for (const item of geographyData) {
        const zipStr = item.postalCode.toString();
        if (zipStr.startsWith(query) && !seen.has(zipStr)) {
            seen.add(zipStr);
            results.push({
                postalCode: zipStr,
                districtNameTh: item.districtNameTh,
                districtNameEn: item.districtNameEn,
                provinceNameTh: item.provinceNameTh,
                provinceNameEn: item.provinceNameEn
            });
        }
        if (results.length >= 10) break; // Limit to 10 results
    }
    
    return results;
}

/**
 * Show zip code suggestions dropdown
 */
function showZipSuggestions(query) {
    const results = searchZipCodes(query);
    
    log(`🔍 Search "${query}" → Found ${results.length} matches`, 'info');
    
    if (results.length === 0) {
        zipSuggestions.classList.remove('show');
        return;
    }
    
    // Build suggestion HTML
    zipSuggestions.innerHTML = results.map(item => {
        const district = currentLang === 'th' ? item.districtNameTh : item.districtNameEn;
        const province = currentLang === 'th' ? item.provinceNameTh : item.provinceNameEn;
        return `
        <div class="suggestion-item" data-zip="${item.postalCode}">
            <span>${item.postalCode}</span>
            <span class="district-name">${district}, ${province}</span>
        </div>
    `}).join('');
    
    zipSuggestions.classList.add('show');
    
    // Add click handlers to suggestions
    zipSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const zip = item.dataset.zip;
            zipCodeInput.value = zip;
            zipSuggestions.classList.remove('show');
            
            log(`✅ User selected zip: ${zip}`, 'action');
            highlightCode('zip-selected');
            isManualMode = false;
            onZipCodeSelected(zip);
        });
    });
}

function hideZipSuggestions() {
    setTimeout(() => {
        zipSuggestions.classList.remove('show');
    }, 150);
}

// ===== DATA FILTERING FUNCTIONS =====

/**
 * Filter geography data by zip code
 */
function getDataByZipCode(zipCode) {
    return geographyData.filter(item => item.postalCode.toString() === zipCode);
}

/**
 * Get unique provinces from data
 */
function getUniqueProvinces(data) {
    const map = new Map();
    data.forEach(item => {
        if (!map.has(item.provinceCode)) {
            map.set(item.provinceCode, {
                code: item.provinceCode,
                nameTh: item.provinceNameTh,
                nameEn: item.provinceNameEn
            });
        }
    });
    // Sort alphabetically based on current language
    return Array.from(map.values()).sort((a, b) => {
        const nameA = currentLang === 'th' ? a.nameTh : a.nameEn;
        const nameB = currentLang === 'th' ? b.nameTh : b.nameEn;
        return nameA.localeCompare(nameB, currentLang);
    });
}

/**
 * Get districts filtered by province (or all if null)
 */
function getDistrictsByProvince(data, provinceCode) {
    const map = new Map();
    const filtered = provinceCode 
        ? data.filter(item => item.provinceCode === parseInt(provinceCode))
        : data;
    filtered.forEach(item => {
        if (!map.has(item.districtCode)) {
            map.set(item.districtCode, {
                code: item.districtCode,
                nameTh: item.districtNameTh,
                nameEn: item.districtNameEn,
                provinceCode: item.provinceCode
            });
        }
    });
    return Array.from(map.values()).sort((a, b) => {
        const nameA = currentLang === 'th' ? a.nameTh : a.nameEn;
        const nameB = currentLang === 'th' ? b.nameTh : b.nameEn;
        return nameA.localeCompare(nameB, currentLang);
    });
}

/**
 * Get subdistricts filtered by district (or all if null)
 */
function getSubdistrictsByDistrict(data, districtCode) {
    const map = new Map();
    const filtered = districtCode 
        ? data.filter(item => item.districtCode === parseInt(districtCode))
        : data;
    filtered.forEach(item => {
        if (!map.has(item.subdistrictCode)) {
            map.set(item.subdistrictCode, {
                code: item.subdistrictCode,
                nameTh: item.subdistrictNameTh,
                nameEn: item.subdistrictNameEn,
                postalCode: item.postalCode,
                districtCode: item.districtCode
            });
        }
    });
    return Array.from(map.values()).sort((a, b) => {
        const nameA = currentLang === 'th' ? a.nameTh : a.nameEn;
        const nameB = currentLang === 'th' ? b.nameTh : b.nameEn;
        return nameA.localeCompare(nameB, currentLang);
    });
}

/**
 * Get the appropriate data source based on mode
 */
function getActiveDataSource() {
    return (isManualMode || selectedZipData.length === 0) ? geographyData : selectedZipData;
}

// ===== POPULATE DROPDOWN FUNCTIONS =====

function populateProvinces(provinces) {
    const placeholder = uiLabels.provincePlaceholder[currentLang];
    provinceSelect.innerHTML = `<option value="">${placeholder}</option>`;
    provinces.forEach(p => {
        const name = currentLang === 'th' ? p.nameTh : p.nameEn;
        provinceSelect.innerHTML += `<option value="${p.code}">${name}</option>`;
    });
    provinceSelect.disabled = false;
}

function populateDistricts(districts) {
    const placeholder = uiLabels.districtPlaceholder[currentLang];
    districtSelect.innerHTML = `<option value="">${placeholder}</option>`;
    districts.forEach(d => {
        const name = currentLang === 'th' ? d.nameTh : d.nameEn;
        districtSelect.innerHTML += `<option value="${d.code}">${name}</option>`;
    });
    districtSelect.disabled = false;
}

function populateSubdistricts(subdistricts) {
    const placeholder = uiLabels.subdistrictPlaceholder[currentLang];
    subdistrictSelect.innerHTML = `<option value="">${placeholder}</option>`;
    subdistricts.forEach(s => {
        const name = currentLang === 'th' ? s.nameTh : s.nameEn;
        subdistrictSelect.innerHTML += `<option value="${s.code}" data-zip="${s.postalCode}">${name}</option>`;
    });
    subdistrictSelect.disabled = false;
}



// ===== EVENT HANDLERS =====

/**
 * Handle when zip code is selected
 */
function onZipCodeSelected(zipCode) {
    log(`📍 onZipCodeSelected("${zipCode}")`, 'cascade');
    highlightCode('zip-filter');
    
    selectedZipData = getDataByZipCode(zipCode);
    
    if (selectedZipData.length === 0) {
        log('⚠️ No data found for this zip code', 'error');
        return;
    }
    
    log(`   → Found ${selectedZipData.length} records for this zip`, 'info');
    
    // Populate provinces from zip-filtered data
    highlightCode('zip-province');
    const provinces = getUniqueProvinces(selectedZipData);
    populateProvinces(provinces);
    
    log(`   → Populated ${provinces.length} province(s)`, 'info');
    highlightCode('zip-populate');
    
    // Auto-select if only one province
    if (provinces.length === 1) {
        provinceSelect.value = provinces[0].code;
        log(`   → Auto-selected province: ${provinces[0].nameTh}`, 'cascade');
        onProvinceChange(false);
    }
    
    document.getElementById('zipGroup').classList.remove('error');
    updateState();
    updateOutputPreview();
}

/**
 * Handle province change
 * @param {boolean} isUserAction - True if user manually changed, false if auto-cascaded
 */
function onProvinceChange(isUserAction = true) {
    const provinceCode = provinceSelect.value;
    
    if (isUserAction) {
        log(`👤 User changed province to: ${provinceSelect.options[provinceSelect.selectedIndex]?.text}`, 'action');
        highlightCode('province-change');
        
        // Switch to manual mode when user manually changes
        if (provinceCode) {
            isManualMode = true;
            log('   → Switched to MANUAL_MODE', 'info');
        }
    }
    
    if (!provinceCode) {
        districtSelect.innerHTML = '<option value="">เลือกเขต/อำเภอ</option>';
        districtSelect.disabled = true;
        subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
        subdistrictSelect.disabled = true;
        updateState();
        return;
    }
    
    // Get districts from appropriate data source
    highlightCode('province-filter');
    const dataSource = getActiveDataSource();
    const districts = getDistrictsByProvince(dataSource, provinceCode);
    populateDistricts(districts);
    
    log(`   → Populated ${districts.length} district(s)`, 'cascade');
    highlightCode('province-populate');
    
    // Auto-select if only one district
    if (districts.length === 1) {
        districtSelect.value = districts[0].code;
        log(`   → Auto-selected district: ${districts[0].nameTh}`, 'cascade');
        onDistrictChange(false);
    } else {
        subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
        subdistrictSelect.disabled = true;
    }
    
    document.getElementById('provinceGroup').classList.remove('error');
    updateState();
    updateOutputPreview();
}

/**
 * Handle district change
 */
function onDistrictChange(isUserAction = true) {
    const districtCode = districtSelect.value;
    
    if (isUserAction) {
        log(`👤 User changed district to: ${districtSelect.options[districtSelect.selectedIndex]?.text}`, 'action');
        highlightCode('district-change');
        
        if (districtCode) {
            isManualMode = true;
        }
    }
    
    if (!districtCode) {
        subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
        subdistrictSelect.disabled = true;
        updateState();
        return;
    }
    
    // Get subdistricts from appropriate data source
    highlightCode('district-filter');
    const dataSource = getActiveDataSource();
    const subdistricts = getSubdistrictsByDistrict(dataSource, districtCode);
    populateSubdistricts(subdistricts);
    
    log(`   → Populated ${subdistricts.length} subdistrict(s)`, 'cascade');
    highlightCode('district-populate');
    
    // Auto-select if only one subdistrict
    if (subdistricts.length === 1) {
        subdistrictSelect.value = subdistricts[0].code;
        log(`   → Auto-selected subdistrict: ${subdistricts[0].nameTh}`, 'cascade');
        onSubdistrictChange(false);
    }
    
    document.getElementById('districtGroup').classList.remove('error');
    updateState();
    updateOutputPreview();
}

/**
 * Handle subdistrict change
 */
function onSubdistrictChange(isUserAction = true) {
    if (isUserAction) {
        log(`👤 User changed subdistrict to: ${subdistrictSelect.options[subdistrictSelect.selectedIndex]?.text}`, 'action');
        highlightCode('subdistrict-change');
    }
    
    // Sync zip code with selected subdistrict
    if (subdistrictSelect.value) {
        const selectedOption = subdistrictSelect.options[subdistrictSelect.selectedIndex];
        const newZip = selectedOption.dataset.zip;
        
        if (newZip && newZip !== zipCodeInput.value) {
            zipCodeInput.value = newZip;
            highlightCode('subdistrict-sync');
            log(`   → Synced zip code to: ${newZip}`, 'cascade');
            document.getElementById('zipGroup').classList.remove('error');
        }
    }
    
    document.getElementById('subdistrictGroup').classList.remove('error');
    updateState();
    updateOutputPreview();
}

/**
 * Reset all location dropdowns - keeps them fully interactive
 */
function resetLocationDropdowns() {
    log('🔄 Reset all location dropdowns', 'action');
    
    initializeAllProvinces();
    
    selectedZipData = [];
    isManualMode = false;
    
    updateState();
    updateOutputPreview();
}

// ===== FORM FUNCTIONS =====

function getFormData() {
    return {
        houseNo: document.getElementById('houseNo')?.value.trim() || '',
        soi: document.getElementById('soi')?.value.trim() || '',
        moo: document.getElementById('moo')?.value.trim() || '',
        buildingName: document.getElementById('buildingName')?.value.trim() || '',
        streetName: document.getElementById('streetName')?.value.trim() || '',
        tumbon: subdistrictSelect.options[subdistrictSelect.selectedIndex]?.text || '',
        amphur: districtSelect.options[districtSelect.selectedIndex]?.text || '',
        city: provinceSelect.options[provinceSelect.selectedIndex]?.text || '',
        zip: zipCodeInput?.value.trim() || ''
    };
}

function validateForm() {
    let isValid = true;
    
    const requiredFields = [
        { id: 'zipCode', groupId: 'zipGroup' },
        { id: 'province', groupId: 'provinceGroup' },
        { id: 'district', groupId: 'districtGroup' },
        { id: 'subdistrict', groupId: 'subdistrictGroup' },
        { id: 'houseNo', groupId: 'houseNoGroup' }
    ];
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const group = document.getElementById(field.groupId);
        
        if (!element?.value.trim()) {
            group?.classList.add('error');
            isValid = false;
        } else {
            group?.classList.remove('error');
        }
    });
    
    log(isValid ? '✅ Form validation passed' : '❌ Form validation failed', isValid ? 'action' : 'error');
    
    return isValid;
}

function formatAddressDisplay(data) {
    const parts = [];
    if (data.houseNo) parts.push(data.houseNo);
    if (data.buildingName) parts.push(data.buildingName);
    if (data.streetName) parts.push(data.streetName);
    
    // Use correct Thai prefix based on province
    // กรุงเทพมหานคร = แขวง/เขต, ต่างจังหวัด = ตำบล/อำเภอ
    const isBangkok = data.city && (data.city.includes('กรุงเทพ') || data.city.includes('Bangkok'));
    
    if (currentLang === 'th') {
        const subdistrictPrefix = isBangkok ? 'แขวง' : 'ตำบล';
        const districtPrefix = isBangkok ? 'เขต' : 'อำเภอ';
        const provincePrefix = isBangkok ? '' : 'จังหวัด';
        
        if (data.tumbon) parts.push(`${subdistrictPrefix}${data.tumbon}`);
        if (data.amphur) parts.push(`${districtPrefix}${data.amphur}`);
        if (data.city) parts.push(`${provincePrefix}${data.city}`);
    } else {
        // EN format: just correct ordering is usually enough, prefixes optional
        if (data.tumbon) parts.push(data.tumbon);
        if (data.amphur) parts.push(data.amphur);
        if (data.city) parts.push(data.city);
    }

    if (data.zip) parts.push(data.zip);
    return parts.join(' ');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    log('📤 Form submitted', 'action');
    
    if (!validateForm()) return;
    
    const addressData = getFormData();
    confirmAddress.textContent = formatAddressDisplay(addressData);
    modalOverlay.classList.add('show');
    
    log('📋 Showing confirmation modal', 'info');
}

function handleConfirm() {
    const addressData = getFormData();
    log('✅ Address confirmed!', 'action');
    console.log('Final Address Data:', addressData);
    
    // Localized alert/message
    const msg = currentLang === 'th' 
        ? 'ที่อยู่ถูกบันทึกเรียบร้อยแล้ว!\n\nดูข้อมูลใน Console'
        : 'Address saved successfully!\n\nCheck console for data.';
        
    alert(msg);
    modalOverlay.classList.remove('show');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Language Toggle
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Zip code input with validation
    zipCodeInput.addEventListener('input', (e) => {
        const startTime = performance.now();
        highlightCode('input-event');
        
        // Step 1: Sanitize - remove non-numeric
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        highlightCode('validate-zip');
        
        // Show/hide clear button
        clearZipBtn.classList.toggle('show', value.length > 0);
        
        if (value.length >= 1) {
            highlightCode('search-zip');
            const filterStart = performance.now();
            showZipSuggestions(value);
            if (metricFilter) metricFilter.textContent = `${(performance.now() - filterStart).toFixed(2)} ms`;
            highlightCode('render-suggestion');
        } else {
            zipSuggestions.classList.remove('show');
            resetLocationDropdowns();
        }
        
        // Step 2: Validate format (5 digits, starts with 1-9)
        if (value.length === 5) {
            if (validateZipFormat(value)) {
                log(`✅ Zip format valid: ${value}`, 'action');
                hideZipSuggestions();
                highlightCode('select-zip');
                isManualMode = false;
                onZipCodeSelected(value);
            } else {
                log(`⚠️ Invalid zip format: ${value} (must start with 1-9)`, 'error');
            }
        }
        
        updateOutputPreview();
        updateDebugPanel();
        if (metricRender) metricRender.textContent = `${(performance.now() - startTime).toFixed(2)} ms`;
    });
    
    zipCodeInput.addEventListener('blur', hideZipSuggestions);
    zipCodeInput.addEventListener('focus', () => {
        if (zipCodeInput.value.length >= 1) {
            showZipSuggestions(zipCodeInput.value);
        }
    });
    
    // Clear zip button
    clearZipBtn.addEventListener('click', () => {
        zipCodeInput.value = '';
        clearZipBtn.classList.remove('show');
        zipCodeInput.focus();
        resetLocationDropdowns();
    });
    
    // Dropdown changes
    provinceSelect.addEventListener('change', () => onProvinceChange(true));
    districtSelect.addEventListener('change', () => onDistrictChange(true));
    subdistrictSelect.addEventListener('change', () => onSubdistrictChange(true));
    
    // Form submission
    addressForm.addEventListener('submit', handleFormSubmit);
    
    // Modal buttons
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        log('❌ User cancelled confirmation', 'info');
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    });
    
    // Keyboard navigation for suggestions
    zipCodeInput.addEventListener('keydown', (e) => {
        const items = zipSuggestions.querySelectorAll('.suggestion-item');
        const active = zipSuggestions.querySelector('.suggestion-item.active');
        
        if (!items.length || !zipSuggestions.classList.contains('show')) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!active) {
                items[0].classList.add('active');
            } else {
                const next = active.nextElementSibling;
                active.classList.remove('active');
                (next || items[0]).classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!active) {
                items[items.length - 1].classList.add('active');
            } else {
                const prev = active.previousElementSibling;
                active.classList.remove('active');
                (prev || items[items.length - 1]).classList.add('active');
            }
        } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            active.click();
        } else if (e.key === 'Escape') {
            hideZipSuggestions();
        }
    });
    
    // Update output preview on any input change
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', updateOutputPreview);
    });
}

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', async () => {
    log('🚀 Application starting...', 'info');
    await loadGeographyData();
    initEventListeners();
    updateOutputPreview();
    log('✅ Application ready!', 'action');
});
