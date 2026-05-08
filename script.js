// ==========================================
// 1. AI 深度推論核心 (由你原本的 js 檔優化而來)
// ==========================================
async function getAIRereasoning(soapNote) {
    const NGROK_URL = ' https://f5d1-49-158-79-138.ngrok-free.app';
    const API_KEY = '10W4R2Y-V3SMV5W-MYYZX0S-GBQMYCR'; 
    const WORKSPACE_SLUG = '681071c0-d178-47ce-963b-88c325eabab8'; 

    // 建立給 AI 的指令
    const prompt = `你是一位資深物理治療師，請根據以下【病患個案 SOAP】以及你所學的【物理治療醫學課本】知識，提供專業推論：\n\n${soapNote}`;

    try {
        const response = await fetch(`${NGROK_URL}/api/v1/workspace/${WORKSPACE_SLUG}/chat`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                message: prompt,
                mode: 'query', // 啟動 RAG 翻書模式
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 錯誤: ${response.status} - ${errorData.error || '未知錯誤'}`);
        }

        const data = await response.json();
        const result = data.textResponse || data.content;
        console.log("AI 的推論結果：", result);
        return result;
    } catch (error) {
        console.error("連線錯誤：", error.message);
        return "抱歉，目前無法連接到本地 AI 伺服器，請確保 AnythingLLM 已開啟。";
    }
}

// ==========================================
// 2. 修改後的 switchView (直接接在裡面)
// ==========================================
async function switchView(viewName) {
    const assessDiv = document.getElementById('view-assessment');
    const reportDiv = document.getElementById('view-report');
    const btnAssess = document.getElementById('btn-assess');
    const btnReport = document.getElementById('btn-report');
    const diagBox = document.getElementById('diag-output');

    if (viewName === 'report') {
        saveToLocalStorage(); 
        generateRealSOAP(); // 產生病歷
        
        const soapContent = document.getElementById('soap-editor').value;

        // 介面切換
        assessDiv.style.display = 'none';
        reportDiv.style.display = 'block';
        btnAssess.classList.remove('hidden');
        btnReport.classList.add('hidden');

        // 保留原本 logicDB 的初步結果，並顯示「AI 載入中」
        const originalAssessment = diagBox.innerText;
        diagBox.innerHTML = `
            <div class="mb-4 text-slate-500 border-b pb-2">系統初步判斷：<br>${originalAssessment}</div>
            <div id="ai-loading" class="p-3 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-600 animate-pulse rounded">
                <span class="material-icons text-[14px] align-middle mr-1">auto_awesome</span> 
                正在翻閱 3 本醫學課本進行深度推論中...
            </div>
        `;

        // 呼叫你的 AI 函式
        const aiInsight = await getAIRereasoning(soapContent);

        // 移除載入動畫，顯示最終結果
        const loadingEl = document.getElementById('ai-loading');
        if(loadingEl) loadingEl.remove();
        
        diagBox.innerHTML = `
        <div class="mb-4 text-slate-500 border-b pb-2">系統初步判斷：<br>${originalAssessment}</div>
        <div class="text-indigo-900 bg-white p-4 rounded-lg border-2 border-indigo-100 shadow-sm">
        <div class="flex items-center font-black text-indigo-700 mb-2">
            <span class="material-icons text-[18px] mr-1">menu_book</span> 物理治療課本深度分析：
        </div>
            <div class="text-xs leading-relaxed text-left" style="white-space: pre-wrap;">${aiInsight}</div>
        </div>
`;

    } else {
        assessDiv.style.display = 'grid';
        reportDiv.style.display = 'none';
        btnAssess.classList.add('hidden');
        btnReport.classList.remove('hidden');
    }
}
