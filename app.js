// ===== Thai Address Auto-fill Application =====
// Learning Demo for Junior Developers
// ==============================================

// ===== GLOBAL STATE =====
let geographyData = [];      // All geography data from JSON
let selectedZipData = [];    // Filtered data by zip code
let isManualMode = false;    // Track if user is manually editing

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

// Learning Panel Elements
const eventLog = document.getElementById('eventLog');
const outputPreview = document.getElementById('outputPreview');
const stateMode = document.getElementById('stateMode');
const stateZipCount = document.getElementById('stateZipCount');
const stateProvince = document.getElementById('stateProvince');
const stateDistrict = document.getElementById('stateDistrict');
const stateSubdistrict = document.getElementById('stateSubdistrict');

// ===== LOGGING FUNCTIONS (For Learning Panel) =====
function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `${new Date().toLocaleTimeString()} | ${message}`;
    eventLog.appendChild(entry);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // Keep only last 50 entries
    while (eventLog.children.length > 50) {
        eventLog.removeChild(eventLog.firstChild);
    }
}

function updateState() {
    stateMode.textContent = isManualMode ? 'MANUAL_MODE' : 'ZIP_MODE';
    stateZipCount.textContent = selectedZipData.length;
    stateProvince.textContent = provinceSelect.options[provinceSelect.selectedIndex]?.text || '-';
    stateDistrict.textContent = districtSelect.options[districtSelect.selectedIndex]?.text || '-';
    stateSubdistrict.textContent = subdistrictSelect.options[subdistrictSelect.selectedIndex]?.text || '-';
}

function updateOutputPreview() {
    const data = getFormData();
    outputPreview.textContent = JSON.stringify(data, null, 2);
}

// ===== DATA LOADING =====
async function loadGeographyData() {
    log('📥 Loading geography.json...', 'action');
    
    try {
        const response = await fetch('geography.json');
        if (!response.ok) throw new Error('Failed to load data');
        geographyData = await response.json();
        
        log(`✅ Loaded ${geographyData.length} geography records`, 'action');
        
        // Initialize all provinces for when user wants to manually select
        initializeAllProvinces();
        updateState();
        
    } catch (error) {
        log(`❌ Error loading data: ${error.message}`, 'error');
        console.error('Error loading geography data:', error);
        
        // Show helpful error message for CORS issue
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            const message = `⚠️ CORS Error - ไม่สามารถโหลดข้อมูลได้

เนื่องจากคุณเปิดไฟล์โดยตรง (file://) Browser จะบล็อก fetch requests

วิธีแก้ไข:
1. ใช้ VS Code + Live Server Extension
2. หรือรัน: npx serve .
3. หรือรัน: python -m http.server 8000

แล้วเปิด http://localhost:5500 หรือ http://localhost:8000`;
            
            alert(message);
            log('💡 Solution: Use a local web server (Live Server, npx serve, etc.)', 'error');
        } else {
            alert('ไม่สามารถโหลดข้อมูลที่อยู่ได้ กรุณาลองใหม่อีกครั้ง');
        }
    }
}

// ===== INITIALIZE ALL PROVINCES =====
function initializeAllProvinces() {
    const provinces = getUniqueProvinces(geographyData);
    populateProvinces(provinces);
    provinceSelect.disabled = true; // Disabled until zip entered
    districtSelect.disabled = true;
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
                provinceNameTh: item.provinceNameTh
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
    zipSuggestions.innerHTML = results.map(item => `
        <div class="suggestion-item" data-zip="${item.postalCode}">
            <span>${item.postalCode}</span>
            <span class="district-name">${item.districtNameTh}</span>
        </div>
    `).join('');
    
    zipSuggestions.classList.add('show');
    
    // Add click handlers to suggestions
    zipSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const zip = item.dataset.zip;
            zipCodeInput.value = zip;
            zipSuggestions.classList.remove('show');
            
            log(`✅ User selected zip: ${zip}`, 'action');
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
                nameTh: item.provinceNameTh
            });
        }
    });
    // Sort alphabetically in Thai
    return Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
}

/**
 * Get districts filtered by province
 */
function getDistrictsByProvince(data, provinceCode) {
    const map = new Map();
    data.filter(item => item.provinceCode === parseInt(provinceCode))
        .forEach(item => {
            if (!map.has(item.districtCode)) {
                map.set(item.districtCode, {
                    code: item.districtCode,
                    nameTh: item.districtNameTh
                });
            }
        });
    return Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
}

/**
 * Get subdistricts filtered by district
 */
function getSubdistrictsByDistrict(data, districtCode) {
    const map = new Map();
    data.filter(item => item.districtCode === parseInt(districtCode))
        .forEach(item => {
            if (!map.has(item.subdistrictCode)) {
                map.set(item.subdistrictCode, {
                    code: item.subdistrictCode,
                    nameTh: item.subdistrictNameTh,
                    postalCode: item.postalCode
                });
            }
        });
    return Array.from(map.values()).sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
}

/**
 * Get the appropriate data source based on mode
 */
function getActiveDataSource() {
    return (isManualMode || selectedZipData.length === 0) ? geographyData : selectedZipData;
}

// ===== POPULATE DROPDOWN FUNCTIONS =====

function populateProvinces(provinces) {
    provinceSelect.innerHTML = '<option value="">เลือกจังหวัด</option>';
    provinces.forEach(p => {
        provinceSelect.innerHTML += `<option value="${p.code}">${p.nameTh}</option>`;
    });
    provinceSelect.disabled = false;
}

function populateDistricts(districts) {
    districtSelect.innerHTML = '<option value="">เลือกเขต/อำเภอ</option>';
    districts.forEach(d => {
        districtSelect.innerHTML += `<option value="${d.code}">${d.nameTh}</option>`;
    });
    districtSelect.disabled = false;
}

function populateSubdistricts(subdistricts) {
    subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
    subdistricts.forEach(s => {
        subdistrictSelect.innerHTML += `<option value="${s.code}" data-zip="${s.postalCode}">${s.nameTh}</option>`;
    });
    subdistrictSelect.disabled = false;
}

// ===== EVENT HANDLERS =====

/**
 * Handle when zip code is selected
 */
function onZipCodeSelected(zipCode) {
    log(`📍 onZipCodeSelected("${zipCode}")`, 'cascade');
    
    selectedZipData = getDataByZipCode(zipCode);
    
    if (selectedZipData.length === 0) {
        log('⚠️ No data found for this zip code', 'error');
        return;
    }
    
    log(`   → Found ${selectedZipData.length} records for this zip`, 'info');
    
    // Populate provinces from zip-filtered data
    const provinces = getUniqueProvinces(selectedZipData);
    populateProvinces(provinces);
    
    log(`   → Populated ${provinces.length} province(s)`, 'info');
    
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
    const dataSource = getActiveDataSource();
    const districts = getDistrictsByProvince(dataSource, provinceCode);
    populateDistricts(districts);
    
    log(`   → Populated ${districts.length} district(s)`, 'cascade');
    
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
    const dataSource = getActiveDataSource();
    const subdistricts = getSubdistrictsByDistrict(dataSource, districtCode);
    populateSubdistricts(subdistricts);
    
    log(`   → Populated ${subdistricts.length} subdistrict(s)`, 'cascade');
    
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
    }
    
    // Sync zip code with selected subdistrict
    if (subdistrictSelect.value) {
        const selectedOption = subdistrictSelect.options[subdistrictSelect.selectedIndex];
        const newZip = selectedOption.dataset.zip;
        
        if (newZip && newZip !== zipCodeInput.value) {
            zipCodeInput.value = newZip;
            log(`   → Synced zip code to: ${newZip}`, 'cascade');
            document.getElementById('zipGroup').classList.remove('error');
        }
    }
    
    document.getElementById('subdistrictGroup').classList.remove('error');
    updateState();
    updateOutputPreview();
}

/**
 * Reset all location dropdowns
 */
function resetLocationDropdowns() {
    log('🔄 Reset all location dropdowns', 'action');
    
    initializeAllProvinces();
    districtSelect.innerHTML = '<option value="">เลือกเขต/อำเภอ</option>';
    districtSelect.disabled = true;
    subdistrictSelect.innerHTML = '<option value="">เลือกแขวง/ตำบล</option>';
    subdistrictSelect.disabled = true;
    
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
    if (data.tumbon) parts.push(data.tumbon);
    if (data.amphur) parts.push(data.amphur);
    if (data.city) parts.push(data.city);
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
    alert('ที่อยู่ถูกบันทึกเรียบร้อยแล้ว!\n\nดูข้อมูลใน Console');
    modalOverlay.classList.remove('show');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Zip code input
    zipCodeInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Numbers only
        e.target.value = value;
        
        // Show/hide clear button
        clearZipBtn.classList.toggle('show', value.length > 0);
        
        if (value.length >= 1) {
            showZipSuggestions(value);
        } else {
            zipSuggestions.classList.remove('show');
            resetLocationDropdowns();
        }
        
        // Auto-select if exactly 5 digits
        if (value.length === 5) {
            hideZipSuggestions();
            isManualMode = false;
            onZipCodeSelected(value);
        }
        
        updateOutputPreview();
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
