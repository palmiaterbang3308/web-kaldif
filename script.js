// ==========================================
// 1. ANIMASI LATAR BELAKANG
// ==========================================
const backgroundContainer = document.getElementById('backgroundContainer');
let dandelionInterval;
let shootingStarInterval;
let cloudInterval; 
let currentDisks = []; 
let currentVisualView = '2D'; 

function clearBackground() {
    backgroundContainer.innerHTML = '';
    clearInterval(dandelionInterval);
    clearInterval(shootingStarInterval);
    clearInterval(cloudInterval); 
}

function createDandelion() {
    if (document.body.classList.contains('dark-mode')) return; 
    const dandelion = document.createElement('div');
    dandelion.className = 'dandelion';
    dandelion.innerHTML = '☘️'; 
    dandelion.style.left = Math.random() * 100 + 'vw'; 
    dandelion.style.setProperty('--end-x', (Math.random() * 30 - 15) + 'vw');
    dandelion.style.animationDuration = (Math.random() * 4 + 6) + 's';
    backgroundContainer.appendChild(dandelion);
    setTimeout(() => dandelion.remove(), 10000); 
}

function createCloud() {
    if (document.body.classList.contains('dark-mode')) return;
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const size = Math.random() * 100 + 60; 
    cloud.style.width = size + 'px';
    cloud.style.height = (size * 0.4) + 'px'; 
    cloud.style.top = Math.random() * 25 + 'vh'; 
    cloud.style.animationDuration = (Math.random() * 20 + 25) + 's'; 
    backgroundContainer.appendChild(cloud);
    setTimeout(() => cloud.remove(), 50000); 
}

function createShootingStar() {
    if (document.body.classList.contains('light-mode')) return; 
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
    backgroundContainer.appendChild(star);
    setTimeout(() => star.remove(), 1500); 
}

function createStaticStars() {
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'static-star';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.animationDelay = Math.random() * 3 + 's';
        backgroundContainer.appendChild(star);
    }
}

function setupBackground() {
    clearBackground();
    if (document.body.classList.contains('dark-mode')) {
        createStaticStars();
        createShootingStar(); 
        shootingStarInterval = setInterval(createShootingStar, 400);
    } else {
        createDandelion(); 
        dandelionInterval = setInterval(createDandelion, 600); 
        for(let i=0; i<3; i++) setTimeout(createCloud, i * 2500);
        cloudInterval = setInterval(createCloud, 8000); 
    }
}

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    setupBackground();
});

// ==========================================
// 2. KONTROL MENU & INPUT
// ==========================================
let currentMode = 'simpel';
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('modeSimpel').classList.toggle('active', mode === 'simpel');
    document.getElementById('modeKompleks').classList.toggle('active', mode === 'kompleks');
}

const simplePresets = {
    kecil: { h: 15, rb: 5, rm: 8, rt: 7 }, 
    sedang: { h: 25, rb: 10, rm: 15, rt: 12 }, 
    besar: { h: 40, rb: 20, rm: 25, rt: 23 } 
};
let selectedParams = simplePresets.sedang;

function selectSimple(size) {
    selectedParams = simplePresets[size];
    document.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function updateNValue() {
    const nVal = document.getElementById('nInput').value;
    document.getElementById('nValueDisplay').innerText = nVal;
    const modN = document.getElementById('modN');
    if(modN) modN.innerText = `(${nVal})`;
}

function openFormulaModal() {
    document.getElementById('formulaModal').classList.remove('close-state');
    if (typeof MathJax !== 'undefined') MathJax.typesetPromise();
}
function closeFormulaModal() {
    document.getElementById('formulaModal').classList.add('close-state');
}
document.getElementById('formulaModal').addEventListener('click', function(e) {
    if (e.target === this) closeFormulaModal();
});

// ==========================================
// 4. LOGIKA PERHITUNGAN RIEMANN & EKSAK
// ==========================================
function switchVisualView(view) {
    currentVisualView = view;
    document.getElementById('btn2D').classList.remove('active');
    document.getElementById('btn3D').classList.remove('active');
    
    const potCanvas = document.getElementById('potCanvas');
    const pot3D = document.getElementById('pot3D');
    
    if (view === '2D') {
        document.getElementById('btn2D').classList.add('active');
        potCanvas.classList.remove('hidden');
        pot3D.classList.add('hidden');
    } else {
        document.getElementById('btn3D').classList.add('active');
        potCanvas.classList.add('hidden');
        pot3D.classList.remove('hidden');
        
        if (!is3DInitialized) {
            init3D();
            calculate(false); 
        } else if (renderer3D && camera3D) {
            const width = pot3D.clientWidth;
            const height = pot3D.clientHeight;
            camera3D.aspect = width / height;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(width, height);
        }
    }
}

function calculate(animate = true) {
    if (animate) {
        const btn = document.getElementById('calcBtn');
        for(let i=0; i<5; i++) {
            const pop = document.createElement('span');
            pop.className = 'pop-anim';
            pop.innerText = Math.random() > 0.5 ? '🌱' : '☘️';
            pop.style.left = Math.random() * 100 + '%';
            pop.style.top = Math.random() * 100 + '%';
            btn.appendChild(pop);
            setTimeout(() => pop.remove(), 600);
        }
    }

    const n = parseInt(document.getElementById('nInput').value);
    let h, rb, rm, rt;
    if (currentMode === 'simpel') {
        ({ h, rb, rm, rt } = selectedParams);
    } else {
        h = parseFloat(document.getElementById('hInput').value) || 0;
        rb = parseFloat(document.getElementById('rBottomInput').value) || 0;
        rm = parseFloat(document.getElementById('rMidInput').value) || 0;
        rt = parseFloat(document.getElementById('rTopInput').value) || 0;
    }

    if (h === 0) return; 

    // Kalkulasi Numerik (Riemann)
    const dy = h / n;
    let totalVolume = 0;
    currentDisks = []; 

    for (let i = 0; i < n; i++) {
        const yMid = (i + 0.5) * dy;
        let r;
        if (yMid <= h / 2) {
            r = rb + (rm - rb) * (yMid / (h / 2));
        } else {
            r = rm + (rt - rm) * ((yMid - h / 2) / (h / 2));
        }
        const volCakram = Math.PI * Math.pow(r, 2) * dy;
        totalVolume += volCakram;
        currentDisks.push({ i: i + 1, r: r, vol: volCakram, yMid: yMid });
    }

    const volL = totalVolume / 1000;
    const soilKg = volL * 1.12; 

    const plant = document.getElementById('plantType').value;
    const stemDia = parseFloat(document.getElementById('stemInput').value) || 2;
    
    let depthFactor = 0.2; 
    let holeFactor = 2.0; 
    if (plant === 'sedang') { depthFactor = 0.4; holeFactor = 2.5; }
    if (plant === 'dalam') { depthFactor = 0.6; holeFactor = 3.5; }
    
    const depth = h * depthFactor;
    const holeDia = stemDia * holeFactor;

    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('resVolCm').innerText = Math.round(totalVolume).toLocaleString('id-ID');
    document.getElementById('resVolL').innerText = volL.toFixed(2);
    document.getElementById('resSoil').innerText = soilKg.toFixed(1);
    document.getElementById('resDepth').innerText = depth.toFixed(1);
    document.getElementById('resHole').innerText = holeDia.toFixed(1); 

    drawPot(h, rb, rm, rt, n, dy, depth, holeDia);
    if (is3DInitialized) update3D(h, rb, rm, rt, depth, holeDia);
    
    updateIntegralSteps(h, rb, rm, rt); 
    updateCalculationTable(currentDisks, dy, totalVolume); 
    
    if(animate && window.innerWidth < 850 && event && event.type === 'click') {
        document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleDetail() {
    const content = document.getElementById('detailContent');
    const icon = document.getElementById('detailIcon');
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.innerText = '▼';
    } else {
        content.classList.add('hidden');
        icon.innerText = '◀';
    }
}

// ==============================================================
// MODUL INJEKSI: LANGKAH PENGERJAAN INTEGRAL EKSAK (DIPERBAIKI)
// ==============================================================
function updateIntegralSteps(h, rb, rm, rt) {
    const H = h / 2; // Batas integral Y
    
    // Fungsi Helper untuk merapikan angka desimal di LaTeX
    const fmt = (num) => Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(4)).toString();
    const fmtTerm = (coeff, variable) => {
        if (Math.abs(coeff) < 0.00001) return "";
        let sign = coeff >= 0 ? "+" : "-";
        let valStr = fmt(Math.abs(coeff));
        if (valStr === "1" && variable !== "") valStr = ""; 
        return ` ${sign} ${valStr}${variable}`;
    };

    // ------------------------------------
    // PERHITUNGAN SEGMEN 1
    // ------------------------------------
    const m1 = (rm - rb) / H;
    const a1 = Math.pow(rb, 2);
    const b1 = 2 * rb * m1;
    const c1 = Math.pow(m1, 2);
    const v1_val = Math.PI * (a1 * H + (b1 / 2) * Math.pow(H, 2) + (c1 / 3) * Math.pow(H, 3));

    // ------------------------------------
    // PERHITUNGAN SEGMEN 2
    // ------------------------------------
    const m2 = (rt - rm) / H;
    const a2 = Math.pow(rm, 2);
    const b2 = 2 * rm * m2;
    const c2 = Math.pow(m2, 2);
    const v2_val = Math.PI * (a2 * H + (b2 / 2) * Math.pow(H, 2) + (c2 / 3) * Math.pow(H, 3));

    const vTot = v1_val + v2_val;
    const beratEksak = (vTot / 1000) * 1.12;

    // Sintaks diperbaiki dengan mengurangi backslash (\\) agar MathJax dapat membacanya
    const html = `
        <div class="math-step-box" style="background: rgba(243, 156, 18, 0.05); border: 1px solid rgba(243, 156, 18, 0.2);">
            
            <h5 style="color: #d35400; margin-bottom: 8px; border-bottom: 1px dashed rgba(243,156,18,0.3); padding-bottom: 5px;">
                A. Langkah Pengerjaan Segmen 1 (Bawah: 0 ≤ y ≤ ${H})
            </h5>
            <p style="margin-bottom: 8px;">1. Fungsi Jari-jari: \\( f_1(y) = ${fmt(rb)}${fmtTerm(m1, "y")} \\)</p>
            <p style="margin-bottom: 4px;">2. Perhitungan Volume:</p>
            <div style="overflow-x: auto; padding: 5px 0; margin-bottom: 8px; font-size: 0.95rem;">
                \\[
                \\begin{aligned}
                V_1 &= \\pi \\int_{0}^{${H}} (${fmt(rb)}${fmtTerm(m1, "y")})^2 dy \\\\
                &= \\pi \\int_{0}^{${H}} (${fmt(a1)}${fmtTerm(b1, "y")}${fmtTerm(c1, "y^2")}) dy \\\\
                &= \\pi \\left[ ${fmt(a1)}y${fmtTerm(b1/2, "y^2")}${fmtTerm(c1/3, "y^3")} \\right]_{0}^{${H}}
                \\end{aligned}
                \\]
            </div>
            <p>3. Hasil: <strong>\\( V_1 \\approx ${v1_val.toLocaleString('id-ID', {maximumFractionDigits:2})} \\text{ cm}^3 \\)</strong></p>
            
            <h5 style="color: #d35400; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px dashed rgba(243,156,18,0.3); padding-bottom: 5px;">
                B. Langkah Pengerjaan Segmen 2 (Atas: ${H} < y ≤ ${h})
            </h5>
            <p style="margin-bottom: 8px;">1. Fungsi Jari-jari: \\( f_2(y) = ${fmt(rm)}${fmtTerm(m2, "(y - " + H + ")")} \\)</p>
            <p style="margin-bottom: 4px;">2. Perhitungan Volume:</p>
            <div style="overflow-x: auto; padding: 5px 0; margin-bottom: 8px; font-size: 0.95rem;">
                \\[
                \\begin{aligned}
                V_2 &= \\pi \\int_{${H}}^{${h}} (${fmt(rm)}${fmtTerm(m2, "(y - " + H + ")")})^2 dy \\\\
                &= \\pi \\int_{${H}}^{${h}} (${fmt(a2)}${fmtTerm(b2, "(y - " + H + ")")}${fmtTerm(c2, "(y - " + H + ")^2")}) dy \\\\
                &= \\pi \\left[ ${fmt(a2)}(y - ${H})${fmtTerm(b2/2, "(y - " + H + ")^2")}${fmtTerm(c2/3, "(y - " + H + ")^3")} \\right]_{${H}}^{${h}}
                \\end{aligned}
                \\]
            </div>
            <p>3. Hasil: <strong>\\( V_2 \\approx ${v2_val.toLocaleString('id-ID', {maximumFractionDigits:2})} \\text{ cm}^3 \\)</strong></p>
            
            <div style="background: #fdf2e9; padding: 10px; border-radius: 6px; margin-top: 20px; text-align: center; border: 1px solid #e67e22; color: #d35400;">
                <strong>Volume Total Ekstraksi (V₁ + V₂) = ${vTot.toLocaleString('id-ID', {maximumFractionDigits:2})} cm³</strong>
            </div>
        </div>
    `;

    document.getElementById('integralStepsContainer').innerHTML = html;
    
    // Inject variabel ke Kesimpulan Akhir
    document.getElementById('concVolEksak').innerText = Math.round(vTot).toLocaleString('id-ID');
    document.getElementById('concLiterEksak').innerText = (vTot / 1000).toFixed(2);
    document.getElementById('concLiterEksak2').innerText = (vTot / 1000).toFixed(2);
    document.getElementById('concBeratEksak').innerText = beratEksak.toLocaleString('id-ID', {maximumFractionDigits:2});

    if (typeof MathJax !== 'undefined') MathJax.typesetPromise();
}

function updateCalculationTable(disks, dy, totalVol) {
    const n = disks.length;
    
    document.getElementById('detPartisi').innerText = n;
    document.getElementById('concPartisi').innerText = n;
    document.getElementById('detDy').innerText = dy.toFixed(3);
    document.getElementById('detVol').innerText = Math.round(totalVol).toLocaleString('id-ID');
    document.getElementById('concVol').innerText = Math.round(totalVol).toLocaleString('id-ID');
    document.getElementById('concLiter').innerText = (totalVol / 1000).toFixed(2);

    const tbody = document.getElementById('calcTableBody');
    tbody.innerHTML = ''; 
    
    disks.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.i}</td>
            <td>${d.yMid.toFixed(2)}</td>
            <td>${d.r.toFixed(2)}</td>
            <td><strong>${d.vol.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 5. VISUALISASI CANVAS 2D
// ==========================================
function drawPot(h, rb, rm, rt, n, dy, depth, holeDia) {
    const canvas = document.getElementById('potCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvasContainer');
    canvas.width = container.clientWidth;
    canvas.height = 250; 
    
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    
    const scale = (H - 80) / h;
    const centerX = W / 2;
    const baseY = H - 30; 

    ctx.beginPath();
    ctx.moveTo(centerX - rb * scale, baseY); 
    ctx.quadraticCurveTo(centerX - rm * scale, baseY - (h/2) * scale, centerX - rt * scale, baseY - h * scale);
    ctx.lineTo(centerX + rt * scale, baseY - h * scale); 
    ctx.quadraticCurveTo(centerX + rm * scale, baseY - (h/2) * scale, centerX + rb * scale, baseY);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, baseY - h*scale, 0, baseY);
    gradient.addColorStop(0, '#e67e22');
    gradient.addColorStop(1, '#d35400');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; 
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; 
    ctx.lineWidth = 1;

    for (let i = 0; i < currentDisks.length; i++) {
        let d = currentDisks[i];
        const rectWidth = d.r * 2 * scale;
        const rectHeight = dy * scale;
        const rectX = centerX - d.r * scale;
        const rectY = baseY - (i * dy + dy) * scale;
        d.rectX = rectX; d.rectY = rectY; d.rectW = rectWidth; d.rectH = rectHeight;
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    }
    ctx.strokeStyle = '#a04000';
    ctx.lineWidth = 3;
    ctx.stroke();

    const topY = baseY - h * scale;
    const holeRadiusScale = (holeDia / 2) * scale;
    
    ctx.beginPath();
    ctx.moveTo(centerX - holeRadiusScale, topY - 6); ctx.lineTo(centerX + holeRadiusScale, topY - 6); 
    ctx.moveTo(centerX - holeRadiusScale, topY - 10); ctx.lineTo(centerX - holeRadiusScale, topY - 2); 
    ctx.moveTo(centerX + holeRadiusScale, topY - 10); ctx.lineTo(centerX + holeRadiusScale, topY - 2); 
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 3; ctx.stroke();
    
    const isDark = document.body.classList.contains('dark-mode');
    const textStr = `Galian: ${holeDia.toFixed(1)} cm`;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(textStr).width;
    
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(centerX - (textWidth/2) - 8, topY - 28, textWidth + 16, 20, 5) : ctx.rect(centerX - (textWidth/2) - 8, topY - 28, textWidth + 16, 20); 
    ctx.fill();
    ctx.fillStyle = '#2ecc71'; ctx.textAlign = 'center'; ctx.fillText(textStr, centerX, topY - 14);

    const depthY = topY + depth * scale;
    let yPos = h - depth; 
    let rDepth = (yPos <= h / 2) ? (rb + (rm - rb) * (yPos / (h / 2))) : (rm + (rt - rm) * ((yPos - h / 2) / (h / 2)));
    const depthRadiusScale = rDepth * scale;

    ctx.beginPath(); ctx.setLineDash([5, 5]); 
    ctx.moveTo(centerX - depthRadiusScale - 15, depthY); ctx.lineTo(centerX + depthRadiusScale + 15, depthY);
    ctx.strokeStyle = '#ff4757'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); 

    ctx.beginPath(); ctx.arc(centerX, depthY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();

    const textAkar = 'Titik Akar';
    const akarWidth = ctx.measureText(textAkar).width;
    
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(centerX - (akarWidth/2) - 8, depthY + 8, akarWidth + 16, 20, 5) : ctx.rect(centerX - (akarWidth/2) - 8, depthY + 8, akarWidth + 16, 20);
    ctx.fill();
    ctx.fillStyle = '#ff4757'; ctx.fillText(textAkar, centerX, depthY + 22);
}

const canvas = document.getElementById('potCanvas');
const tooltip = document.getElementById('canvasTooltip');
canvas.addEventListener('mousemove', (e) => {
    if(currentDisks.length === 0 || currentVisualView === '3D') return; 
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
    let hoveredDisk = null;
    for (let i = 0; i < currentDisks.length; i++) {
        const d = currentDisks[i];
        if (mouseX >= d.rectX && mouseX <= d.rectX + d.rectW && mouseY >= d.rectY && mouseY <= d.rectY + d.rectH) { hoveredDisk = d; break; }
    }
    if (hoveredDisk) {
        tooltip.innerHTML = `<strong>Irisan #${hoveredDisk.i}</strong><br>Radius: ${hoveredDisk.r.toFixed(1)} cm<br>Vol: ${hoveredDisk.vol.toFixed(1)} cm³`;
        tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY + 15) + 'px'; tooltip.classList.add('visible');
    } else tooltip.classList.remove('visible');
});
canvas.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));

// ==========================================
// 6. VISUALISASI 3D (THREE.JS)
// ==========================================
let scene3D, camera3D, renderer3D, controls3D, potMesh3D;
let is3DInitialized = false;

function init3D() {
    const container = document.getElementById('pot3D');
    scene3D = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    renderer3D = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer3D.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer3D.domElement);

    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true; controls3D.dampingFactor = 0.05; controls3D.enablePan = false;

    scene3D.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); dirLight.position.set(20, 50, 20); scene3D.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3); backLight.position.set(-20, -50, -20); scene3D.add(backLight);

    is3DInitialized = true; animate3D();
}

function animate3D() {
    requestAnimationFrame(animate3D);
    if (controls3D) controls3D.update();
    if (renderer3D && scene3D && camera3D) renderer3D.render(scene3D, camera3D);
}

function update3D(h, rb, rm, rt, depth, holeDia) {
    if (!is3DInitialized) init3D();
    if (potMesh3D) {
        scene3D.remove(potMesh3D);
        if (potMesh3D.geometry) potMesh3D.geometry.dispose();
        if (potMesh3D.material) potMesh3D.material.dispose();
        while(potMesh3D.children.length > 0){ 
            const child = potMesh3D.children[0]; potMesh3D.remove(child); 
            if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose();
        }
    }

    const points = [new THREE.Vector2(0, -h / 2)];
    const segments = 50; 
    for ( let i = 0; i <= segments; i ++ ) {
        const y = (i / segments) * h;
        let r = (y <= h / 2) ? (rb + (rm - rb) * (y / (h / 2))) : (rm + (rt - rm) * ((y - h / 2) / (h / 2)));
        points.push( new THREE.Vector2( r, y - (h/2) ) );
    }

    const geometry = new THREE.LatheGeometry(points, 64); 
    const material = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide });
    potMesh3D = new THREE.Mesh(geometry, material);
    
    const edges = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }));
    potMesh3D.add(line);

    const holeRadius = holeDia / 2;
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(holeRadius - 0.3, holeRadius, 32), new THREE.MeshBasicMaterial({ color: 0x2ecc71, side: THREE.DoubleSide }));
    ringMesh.rotation.x = Math.PI / 2; ringMesh.position.y = (h / 2) + 0.1; 
    potMesh3D.add(ringMesh);

    const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff4757 }));
    sphereMesh.position.y = (h / 2) - depth; potMesh3D.add(sphereMesh);

    const linePoints = [new THREE.Vector3(0, h/2, 0), new THREE.Vector3(0, (h/2) - depth, 0)];
    const depthLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), new THREE.LineDashedMaterial({ color: 0xff4757, dashSize: 1, gapSize: 0.5 }));
    depthLine.computeLineDistances(); potMesh3D.add(depthLine);

    scene3D.add(potMesh3D);
    camera3D.position.set(0, h * 0.8, h * 3); controls3D.target.set(0, 0, 0);
}

function downloadReport() {
    const potCanvas = document.getElementById('potCanvas');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800; tempCanvas.height = 600;
    const ctx = tempCanvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    ctx.fillStyle = isDark ? '#1a1a1a' : '#fdf5e6'; ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = isDark ? '#2d2d2d' : '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 20;
    ctx.roundRect = function(x, y, w, h, r) { if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2; this.beginPath(); this.moveTo(x+r, y); this.arcTo(x+w, y, x+w, y+h, r); this.arcTo(x+w, y+h, x, y+h, r); this.arcTo(x, y+h, x, y, r); this.arcTo(x, y, x+w, y, r); this.closePath(); return this; }
    ctx.roundRect(40, 40, 720, 520, 16).fill(); ctx.shadowBlur = 0; 

    ctx.fillStyle = isDark ? '#ffffff' : '#2c3e50'; ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif'; ctx.fillText('Laporan Kalkulasi Pot (Integral)', 70, 100);
    ctx.drawImage(potCanvas, 70, 120, 660, 250);

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(70, 390); ctx.lineTo(730, 390); ctx.stroke();
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Volume Total    : ${document.getElementById('resVolCm').innerText} cm³`, 70, 440);
    ctx.fillText(`Kapasitas       : ${document.getElementById('resVolL').innerText} Liter`, 70, 480);
    ctx.fillText(`Kebutuhan Tanah : ${document.getElementById('resSoil').innerText} kg`, 70, 520);
    ctx.fillText(`Kedalaman Tanam : ${document.getElementById('resDepth').innerText} cm`, 400, 440);
    ctx.fillText(`Diameter Lubang : ${document.getElementById('resHole').innerText} cm`, 400, 480);
    
    ctx.fillStyle = '#d35400'; ctx.font = 'bold italic 14px "Plus Jakarta Sans", sans-serif'; ctx.fillText('Digenerate oleh PLant Pot Calc', 400, 520);

    const link = document.createElement('a'); link.download = 'Laporan_PlantPot.png'; link.href = tempCanvas.toDataURL('image/png'); link.click();
}

const guideModal = document.getElementById('guide-modal');
const totalPapers = 3;

function openGuideBook() { guideModal.classList.remove('close-state'); }
function closeGuideBook() {
    guideModal.classList.add('close-state');
    setTimeout(() => {
        document.getElementById('bookFlip').classList.remove('open');
        for(let i = 1; i <= totalPapers; i++) {
            let paper = document.getElementById('p' + i);
            paper.classList.remove('flipped');
            paper.style.zIndex = totalPapers - i + 1;
        }
    }, 400);
}
function closeGuideBookOnOutside(event) { if (event.target === guideModal || event.target.classList.contains('book-wrapper')) closeGuideBook(); }
document.addEventListener('keydown', function(event) { if (event.key === 'Escape' && !guideModal.classList.contains('close-state')) closeGuideBook(); });
function goNextPage(paperIndex) {
    const bookFlip = document.getElementById('bookFlip'); const paper = document.getElementById('p' + paperIndex);
    if (paperIndex === 1) bookFlip.classList.add('open');
    paper.classList.add('flipped'); setTimeout(() => { paper.style.zIndex = paperIndex; }, 300); 
}
function goPrevPage(paperIndex) {
    const bookFlip = document.getElementById('bookFlip'); const paper = document.getElementById('p' + paperIndex);
    paper.classList.remove('flipped'); setTimeout(() => { paper.style.zIndex = totalPapers - paperIndex + 1; }, 300);
    if (paperIndex === 1) bookFlip.classList.remove('open');
}

window.onload = () => { setupBackground(); updateNValue(); };