//while (true) {navigator.vibrate( [500, 50, 500] ) }

window.addEventListener('DOMContentLoaded', function () {
    var translate = navigator.mozL10n.get;
    var mainlist = document.getElementById('authcodes');
    var authcodes = [], selectIndex = 0;
    init();
    // functions
    function init(){
        if(window.localStorage.getItem("authcodes")!=null){
            authcodes = JSON.parse(window.localStorage.getItem("authcodes"));
        }else{
            authcodes = [];
        }
        setInterval(refreshCodeList, 800);
    }
    
    function setActiveRemain(){
     
    }

    function refreshCodeList() {
        let ActiveItems = document.getElementsByClassName("active")
                if (ActiveItems[0]) {
                    let authcode_ = authcodes.find(obj => obj.id == ActiveItems[0].id)
                    otplib.authenticator.options = {
                        step: Number(authcode_.period),
                        digits: Number(authcode_.digits),
                        window: 1
                      };
                    let remain = window.otplib.authenticator.timeRemaining();
            
            
                    document.getElementById('time-remaining').innerText = `${remain}s`;
                }
              
        mainlist.innerHTML = '';
        if(authcodes.length > 0){
            authcodes.forEach(element => {
                otplib.authenticator.options = {
                    step: Number(element.period),
                    digits: Number(element.digits),
                    window: 1
                  };
                let code = window.otplib.authenticator.generate(element.secret);
                let item = document.createElement('div');
                item.dataset.id = element.id;
                item.id = element.id;
                //item.style.background = element.color
                item.innerHTML = `
                <style>
                #${element.id} .active {
                    background: rgb(31, 96, 237) !important;
                    color: #ffffff;
                }
                </style>
                <p class="issuer-row">${element.issuer}</p>
                <p class="name-row">${element.name}</p>
                <p class="code-row">
                <span>${numberWithSpaces(code)}</span>
                <span>
                    <svg class="progress" width="0.8em" height="0.8em" viewBox="0 0 125 125">
                        <circle class="progress-value" cx="60" cy="60" r="54" stroke-width="12" />
                    </svg>
                </span>
                </p>
                `;
                //ProgressBar
                let remain = window.otplib.authenticator.timeRemaining();
                let step = window.otplib.authenticator.allOptions().step;
                var progressbar = item.children[3].children[1].children[0].children[0]
                progressbar.style.strokeDasharray = 2 * Math.PI * 54;
                progressbar.style.strokeDashoffset = 2 * Math.PI * 54 * (1 - remain / step);
                //Center Key
                   
              
        
                item.classList.add('authcode-item');
                mainlist.appendChild(item);
                

            });
            selectItemByIndex();
        }
    }
    function aboutDialog(){
        alert("KaiAuth v1.1.1\nCopyright 2020 zjyl1994.\nAll rights reserved.");
    }
    function selectItemByIndex() {
        [].forEach.call(mainlist.children, function (el) {
            el.classList.remove('active');
        });
        if (selectIndex > (authcodes.length - 1)) selectIndex = 0;
        let activeElem = mainlist.children[selectIndex];
        activeElem.classList.add('active');
        activeElem.scrollIntoViewIfNeeded(false);
    }
    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    function generateNewID(){
        var maxID = 0;
        authcodes.forEach(element => {
            if(element.id > maxID) maxID = element.id;
        });
        return maxID + 1;
    }
    function saveList(){
        window.localStorage.setItem('authcodes', JSON.stringify(authcodes));
    }
    function loadSDFile(){
        var sdcard = navigator.getDeviceStorage('sdcard');
        var request = sdcard.get("kaiauth.json");
        request.onsuccess = function () {
            var reader = new FileReader();
            reader.onload = function(e) {
                window.localStorage.setItem('authcodes',reader.result);
                alert(translate('load-success'));
                init();
            }
            reader.readAsText(this.result)
        }
        request.onerror = function () {
            alert(translate('load-error') + this.error.name);
            console.error(this.error);
        }
    }
    function dumpSDFile(){
        var sdcard = navigator.getDeviceStorage('sdcard');
        var deleteRequest = sdcard.delete("kaiauth.json");
        deleteRequest.onsuccess = function () {
            var file = new Blob([window.localStorage.getItem("authcodes")], {type: "application/json"});
            var writeRequest = sdcard.addNamed(file, "kaiauth.json");
            writeRequest.onsuccess = function () {
                alert(translate('dump-success'));
            }
            writeRequest.onerror = function () {
                alert(translate('dump-error') + this.error.name);
                console.error(this.error);
            }
        }
        deleteRequest.onerror = function () {
            alert(this.error.name);
            console.error(this.error);
        }
    }
    // key
    window.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowUp': //scroll up
            case 'ArrowLeft':
                selectIndex--;
                if (selectIndex < 0) selectIndex = authcodes.length - 1;
                selectItemByIndex();
                break;
            case 'ArrowDown': //scroll down
            case 'ArrowRight':
                selectIndex++;
                if (selectIndex > (authcodes.length - 1)) selectIndex = 0;
                selectItemByIndex();
                break;
            case 'SoftLeft':
                var qrcode = new MozActivity({
					name: 'com.zjyl1994.kaiauth.addCode'
				})
				qrcode.onsuccess = function () {
					qrcodeContent = this.result;
                    gaDetail = parseURI(qrcodeContent);
                    console.log(gaDetail)
                    if(gaDetail == null){
                        alert(translate('valid-qrcode'));
                    }else{

                        var totpName = gaDetail.label.account;
                        var issuer = "Unknown Issuer";
                        var digits = 6;
                        var period = 30;

                        if(gaDetail.label.issuer){
                            totpName = totpName;
                            issuer = gaDetail.label.issuer
                        }else{
                            if(gaDetail.query.hasOwnProperty('issuer')){
                                totpName = totpName;
                                issuer = gaDetail.query.issuer
                            }
                        }

                        if(gaDetail.query.hasOwnProperty('digits')){
                                digits = gaDetail.query.digits
                        }
                        if(gaDetail.query.hasOwnProperty('period')){
                                period = gaDetail.query.period
                        }
                        const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
                        const r = randomBetween(0, 255);
                        const g = randomBetween(0, 255);
                        const b = randomBetween(0, 255);
                        const rgb = `rgb(${r},${g},${b})`; // Collect all to a css color string

                        var item = {
                            id: generateNewID(),
                            name: totpName,
                            issuer: issuer,
                            period: period,
                            digits: digits,
                            secret: gaDetail.query.secret,
                            color: rgb
                        }
                        authcodes.push(item);
                        saveList();
                        init();
                        selectIndex = authcodes.length - 1;
                        selectItemByIndex();
                    }
				}
                break;
            case 'SoftRight':
             
                //
                
                var activeItems = document.getElementsByClassName('active');
                var authcodeActiveItem = activeItems.length != 0 ? parseInt(activeItems[0].dataset.id) : 0;
                var menu = new MozActivity({
                    name: 'com.zjyl1994.kaiauth.Menu',
                    data: {activeId:authcodeActiveItem}
				})
				menu.onsuccess = function () {
                    switch(this.result){
                        case 'delete':
                            if(authcodeActiveItem!=0){
                                var result = confirm(translate('delete-confirm'));
                                if(result == true){
                                    authcodes = authcodes.filter(obj => obj.id != authcodeActiveItem);
                                    saveList();
                                    refreshCodeList();
                                }
                            }
                            break;
                        case 'edit-name':
                            if(authcodeActiveItem!=0){
                                var newname = prompt(translate('rename-prompt'))
                                if (newname!=null && newname!=""){
                                    authcodes.find(obj => obj.id == authcodeActiveItem).name = newname;
                                    saveList();
                                    refreshCodeList();
                                }
                            }
                            break;
                        case 'show-secret':
                            if(authcodeActiveItem!=0){
                                alert(authcodes.find(obj => obj.id == authcodeActiveItem).secret);
                            }
                            break;
                        case 'import-sdcard':
                            var result = confirm(translate('import-confirm'));
                            if(result == true){
                                loadSDFile();
                            }
                            break;
                        case 'export-sdcard':
                            dumpSDFile();
                            break;
                        case 'wipe-data':
                            var result = confirm(translate('reset-confirm'));
                            if(result == true){
                                window.localStorage.clear();
                                alert(translate('reset-success'))
                                init();
                            }
                            break;
                        case 'about':
                            aboutDialog();
                            break;
                    }
                }
        }
    });
}, false);