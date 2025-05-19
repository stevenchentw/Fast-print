// Cookie 操作
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? decodeURIComponent(v[2]) : '';
}

// 縣市下拉選單初始化
function initializeCityDropdowns() {
  // 取得所有縣市
  const cities = Object.keys(twZipCodeData);
  
  // 填充縣市選單
  const citySelects = document.querySelectorAll('.city-select');
  citySelects.forEach(select => {
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });
  });
  
  // 縣市選擇事件
  document.getElementById('senderCity').addEventListener('change', function() {
    updateDistrictOptions('sender', this.value);
    setCookie('senderCity', this.value, 365);
  });
  
  document.getElementById('receiverCity').addEventListener('change', function() {
    updateDistrictOptions('receiver', this.value);
  });
}

// 更新區域選單
function updateDistrictOptions(prefix, city) {
  const districtSelect = document.getElementById(prefix + 'District');
  const zipInput = document.getElementById(prefix + 'Zip');
  
  // 清空現有選項和郵遞區號
  districtSelect.innerHTML = '<option value="">請選擇區域</option>';
  zipInput.value = '';
  
  if (city && twZipCodeData[city]) {
    const districts = Object.keys(twZipCodeData[city]);
    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
}

// 區域選擇事件綁定
function bindDistrictEvents() {
  document.getElementById('senderDistrict').addEventListener('change', function() {
    const city = document.getElementById('senderCity').value;
    if (city && this.value) {
      document.getElementById('senderZip').value = twZipCodeData[city][this.value];
      setCookie('senderDistrict', this.value, 365);
      setCookie('senderZip', document.getElementById('senderZip').value, 365);
    }
    updatePreview();
  });
  
  document.getElementById('receiverDistrict').addEventListener('change', function() {
    const city = document.getElementById('receiverCity').value;
    if (city && this.value) {
      document.getElementById('receiverZip').value = twZipCodeData[city][this.value];
    }
    updatePreview();
  });
}

// 初始化寄件人欄位
window.onload = function() {
  // 初始化縣市選單
  initializeCityDropdowns();
  bindDistrictEvents();
  
  // 載入 cookie 儲存的寄件人資訊
  document.getElementById('senderName').value = getCookie('senderName');
  document.getElementById('senderPhone').value = getCookie('senderPhone');
  document.getElementById('senderAddress').value = getCookie('senderAddress');
  
  // 載入縣市區域
  const senderCity = getCookie('senderCity');
  if (senderCity) {
    document.getElementById('senderCity').value = senderCity;
    updateDistrictOptions('sender', senderCity);
    
    setTimeout(() => {
      const senderDistrict = getCookie('senderDistrict');
      if (senderDistrict) {
        document.getElementById('senderDistrict').value = senderDistrict;
        document.getElementById('senderZip').value = getCookie('senderZip');
      }
      updatePreview();
    }, 100);
  }
}

// 預覽功能
function updatePreview() {
  const senderName = document.getElementById('senderName').value;
  const senderPhone = document.getElementById('senderPhone').value;
  const senderCity = document.getElementById('senderCity').value;
  const senderDistrict = document.getElementById('senderDistrict').value;
  const senderZip = document.getElementById('senderZip').value;
  const senderAddress = document.getElementById('senderAddress').value;
  
  const receiverName = document.getElementById('receiverName').value;
  const receiverPhone = document.getElementById('receiverPhone').value;
  const receiverCity = document.getElementById('receiverCity').value;
  const receiverDistrict = document.getElementById('receiverDistrict').value;
  const receiverZip = document.getElementById('receiverZip').value;
  const receiverAddress = document.getElementById('receiverAddress').value;

  // 組合完整地址
  const fullSenderAddress = [
    senderZip ? `${senderZip}` : '',
    senderCity ? senderCity : '',
    senderDistrict ? senderDistrict : '',
    senderAddress ? senderAddress : ''
  ].filter(item => item).join('');  
  
  const fullReceiverAddress = [
    receiverZip ? `${receiverZip}` : '',
    receiverCity ? receiverCity : '',
    receiverDistrict ? receiverDistrict : '',
    receiverAddress ? receiverAddress : ''
  ].filter(item => item).join('');

  const previewArea = document.getElementById('previewArea');
  previewArea.innerHTML = `
    <div class="label-preview">
      <div class="label-section">
        <div class="label-title">寄件人</div>
        <div class="label-info">
          <div>${senderZip ? senderZip : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${senderCity || senderDistrict || senderAddress ? `${senderCity ? senderCity : ''}${senderDistrict ? senderDistrict : ''}${senderAddress ? senderAddress : ''}` : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${senderName ? senderName : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${senderPhone ? senderPhone : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
        </div>
      </div>
      <div class="label-section">
        <div class="label-title">收件人</div>
        <div class="label-info">
          <div>${receiverZip ? receiverZip : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${receiverCity || receiverDistrict || receiverAddress ? `${receiverCity ? receiverCity : ''}${receiverDistrict ? receiverDistrict : ''}${receiverAddress ? receiverAddress : ''}` : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${receiverName ? receiverName : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
          <div>${receiverPhone ? receiverPhone : '<span style=\'color:#aaa\'>未填寫</span>'}</div>
        </div>
      </div>
    </div>
  `;
}

// 寄件人資訊即時寫入 cookie
['senderName','senderPhone','senderAddress'].forEach(id => {
  document.getElementById(id).addEventListener('input', function() {
    setCookie(id, this.value, 365);
    updatePreview();
  });
});

// 收件人即時預覽
['receiverName','receiverPhone','receiverAddress'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});

document.getElementById('printBtn').onclick = function() {
  updatePreview();
  // 只取 .label-preview 內容
  const previewArea = document.getElementById('previewArea');
  const labelDiv = previewArea.querySelector('.label-preview');
  if (!labelDiv) return;
  const labelHtml = labelDiv.outerHTML;
  // 取得 style
  const styleSheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');
  // 產生新視窗，只帶入標籤內容
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset='utf-8'><title>列印標籤</title><style>${styleSheets}</style></head><body style='margin:0;'>${labelHtml}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 400);
}


document.getElementById('clearBtn').onclick = function() {
  // 清除所有輸入欄位
  ['senderName','senderPhone','senderAddress','receiverName','receiverPhone','receiverAddress'].forEach(id => {
    document.getElementById(id).value = '';
    setCookie(id, '', -1); // 刪除 cookie
  });
  
  // 清除縣市區域選單
  ['senderCity', 'senderDistrict', 'receiverCity', 'receiverDistrict'].forEach(id => {
    document.getElementById(id).value = '';
  });
  
  // 清除郵遞區號
  ['senderZip', 'receiverZip'].forEach(id => {
    document.getElementById(id).value = '';
  });
  
  // 刪除縣市區域相關 cookie
  ['senderCity', 'senderDistrict', 'senderZip'].forEach(id => {
    setCookie(id, '', -1);
  });
  
  updatePreview();
}

// 初始預覽
updatePreview();
