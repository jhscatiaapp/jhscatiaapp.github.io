const players = [];
let pars = Array(18).fill(4);
const HOLES = 18;

const parTableBody = document.getElementById('parTableBody');
const scoreTableBody = document.getElementById('scoreTableBody');
const totalScoresParagraph = document.getElementById('totalScores');
const mainApp = document.getElementById('main-app');
const savedGamesScreen = document.getElementById('saved-games-screen');
const savedGamesListDiv = document.getElementById('savedGamesList');

// 초기 파(Par) 테이블 생성
function initializeParTable() {
    let html = `
        <tr>
            <th class="fixed-cell score-table-fixed-header">홀</th>
    `;
    for (let i = 1; i <= HOLES; i++) {
        html += `<th>${i}</th>`;
        if (i === 9) {
            html += `<th class="half-total-score-cell">전반</th>`;
        }
    }
    html += `<th class="half-total-score-cell">후반</th><th class="total-score-cell">총 파</th></tr>`;

    html += `
        <tr>
            <th class="fixed-cell score-table-fixed-header">Par</th>
    `;
    let totalPar = 0;
    let frontNinePar = 0;

    for (let i = 0; i < HOLES; i++) {
        html += `<td><input type="number" class="par-input-field" min="1" value="${pars[i]}" onchange="updatePar(${i}, this.value)"></td>`;
        if (i < 9) {
            frontNinePar += pars[i];
        }
        if (i === 8) {
            html += `<td class="half-total-score-cell">${frontNinePar}</td>`;
        }
        totalPar += pars[i];
    }
    const backNinePar = pars.slice(9, 18).reduce((a, b) => a + b, 0);
    html += `<td class="half-total-score-cell">${backNinePar}</td>`;
    html += `<td class="total-score-cell">${totalPar}</td></tr>`;
    parTableBody.innerHTML = html;
}

// 파 점수 업데이트
function updatePar(holeIndex, parValue) {
    const newPar = parseInt(parValue);
    if (!isNaN(newPar) && newPar > 0) {
        pars[holeIndex] = newPar;
    }
    initializeParTable();
    updateScoreTable();
}

// 플레이어 추가
function addPlayer() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    if (playerName === '') {
        alert('이름을 입력해주세요.');
        return;
    }
    if (players.some(p => p.name === playerName)) {
        alert('이미 같은 이름의 플레이어가 있습니다.');
        return;
    }
    
    players.push({ name: playerName, relativeScores: Array(HOLES).fill(null), totalStrokes: 0, totalRelativeScore: 0 });
    playerNameInput.value = '';
    
    updateScoreTable();
}

// 스코어 테이블 업데이트
function updateScoreTable() {
    let playerRowsHtml = '';

    if (players.length > 0) {
        players.forEach((player, playerIndex) => {
            let rowHtml = `<tr><td class="player-name-cell">${player.name}</td>`;
            let frontNineStrokes = 0;
            let frontNineRelative = 0;
            let backNineStrokes = 0;
            let backNineRelative = 0;
            
            for (let i = 0; i < HOLES; i++) {
                const relativeScore = player.relativeScores[i];
                const displayScore = relativeScore === null ? '' : relativeScore;

                rowHtml += `<td><input type="number" class="score-input" value="${displayScore}" onchange="updateScore(${playerIndex}, ${i}, this.value)"></td>`;
                
                if (relativeScore !== null) {
                    const strokes = pars[i] + relativeScore;
                    if (i < 9) {
                        frontNineStrokes += strokes;
                        frontNineRelative += relativeScore;
                    } else {
                        backNineStrokes += strokes;
                        backNineRelative += relativeScore;
                    }
                }
                if (i === 8) {
                    const displayFrontNine = `${frontNineStrokes} (${frontNineRelative > 0 ? `+${frontNineRelative}` : frontNineRelative})`;
                    rowHtml += `<td class="half-total-score-cell">${displayFrontNine}</td>`;
                }
            }
            
            const totalStrokes = frontNineStrokes + backNineStrokes;
            const totalRelativeScore = frontNineRelative + backNineRelative;

            const displayBackNine = `${backNineStrokes} (${backNineRelative > 0 ? `+${backNineRelative}` : backNineRelative})`;
            rowHtml += `<td class="half-total-score-cell">${displayBackNine}</td>`;
            
            const displayTotal = `${totalStrokes} (${totalRelativeScore > 0 ? `+${totalRelativeScore}` : totalRelativeScore})`;
            rowHtml += `<td class="total-score-cell">${displayTotal}</td></tr>`;
            playerRowsHtml += rowHtml;

            player.totalStrokes = totalStrokes;
            player.totalRelativeScore = totalRelativeScore;
        });
    }

    scoreTableBody.innerHTML = playerRowsHtml;
    
    let headerRow = `
        <tr>
            <th class="fixed-cell score-table-fixed-header">플레이어</th>
    `;
    for (let i = 1; i <= HOLES; i++) {
        headerRow += `<th>${i}</th>`;
        if (i === 9) {
            headerRow += `<th class="half-total-score-cell">전반</th>`;
        }
    }
    headerRow += `<th class="half-total-score-cell">후반</th><th class="total-score-cell">총점</th></tr>`;
    scoreTableBody.innerHTML = headerRow + playerRowsHtml;

    calculateFinalResults();
}

// 스코어 입력 시 업데이트
function updateScore(playerIndex, holeIndex, score) {
    const newScore = score.trim() === '' ? null : parseInt(score);
    if (newScore !== null && !isNaN(newScore)) {
        players[playerIndex].relativeScores[holeIndex] = newScore;
    } else {
        players[playerIndex].relativeScores[holeIndex] = null;
    }
    updateScoreTable();
}

// 최종 점수 및 순위 계산
function calculateFinalResults() {
    const date = document.getElementById('dateInput').value;
    const courseName = document.getElementById('courseNameInput').value;
    const validPlayers = players.filter(player => player.relativeScores.some(score => score !== null));

    validPlayers.sort((a, b) => a.totalRelativeScore - b.totalRelativeScore);

    let finalResultsHtml = '';
    if (validPlayers.length > 0) {
        let currentDate = '';
        if (date) {
             currentDate = new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        
        finalResultsHtml += `<div class="final-results-header">`;
        if (currentDate) {
            finalResultsHtml += `<p><strong>날짜:</strong> ${currentDate}</p>`;
        }
        if (courseName) {
            finalResultsHtml += `<p><strong>골프 코스:</strong> ${courseName}</p>`;
        }
        finalResultsHtml += `</div>`;
        
        finalResultsHtml += '<table><thead><tr><th>순위</th><th>이름</th><th>점수</th></tr></thead><tbody>';

        let currentRank = 1;
        
        validPlayers.forEach((player, index) => {
            if (index > 0 && player.totalRelativeScore > validPlayers[index-1].totalRelativeScore) {
                currentRank = index + 1;
            }

            const displayRelativeScore = player.totalRelativeScore > 0 ? `+${player.totalRelativeScore}` : player.totalRelativeScore;
            finalResultsHtml += `<tr><td>${currentRank}</td><td>${player.name}</td><td>${player.totalStrokes} (${displayRelativeScore})</td></tr>`;
        });
        finalResultsHtml += '</tbody></table>';
    } else {
        finalResultsHtml = '아직 스코어가 입력되지 않았습니다.';
    }

    totalScoresParagraph.innerHTML = finalResultsHtml;
}

// 새 게임 시작 함수
function newGame() {
    const hasUnsavedData = players.length > 0 && 
                           (document.getElementById('dateInput').value || document.getElementById('courseNameInput').value);

    if (hasUnsavedData) {
        const confirmSave = confirm('저장하지 않은 기록이 있습니다. 저장할까요?');
        if (confirmSave) {
            saveGameData();
        }
    }
    
    // 모든 값 초기화
    document.getElementById('dateInput').value = '';
    document.getElementById('courseNameInput').value = '';
    players.length = 0;
    pars = Array(HOLES).fill(4);
    
    initializeParTable();
    updateScoreTable();
    totalScoresParagraph.innerHTML = '';
}

// 데이터 저장 함수
function saveGameData() {
    const date = document.getElementById('dateInput').value;
    const courseName = document.getElementById('courseNameInput').value;
    
    if (!date || !courseName) {
        alert('날짜와 골프 코스 이름을 모두 입력해야 저장할 수 있습니다.');
        return;
    }
    
    let savedGames = JSON.parse(localStorage.getItem('golf_scores')) || [];
    const existingGameIndex = savedGames.findIndex(game => game.date === date && game.courseName === courseName);

    const gameData = {
        id: Date.now(),
        date: date,
        courseName: courseName,
        pars: pars,
        players: players.filter(p => p.relativeScores.some(score => score !== null))
    };

    if (existingGameIndex !== -1) {
        const confirmOverwrite = confirm('같은 날짜, 같은 코스입니다. 기존 기록을 덮어 쓸까요?');
        if (confirmOverwrite) {
            gameData.id = savedGames[existingGameIndex].id; // 기존 ID 유지
            savedGames[existingGameIndex] = gameData;
            localStorage.setItem('golf_scores', JSON.stringify(savedGames));
            alert('기록을 덮어썼습니다!');
        } else {
            alert('저장을 취소했습니다.');
            return;
        }
    } else {
        savedGames.push(gameData);
        localStorage.setItem('golf_scores', JSON.stringify(savedGames));
        alert('경기 기록이 성공적으로 저장되었습니다!');
    }
    
    showSavedGames();
}

// 저장된 기록 목록 화면 보여주기
function showSavedGames() {
    mainApp.style.display = 'none';
    savedGamesScreen.style.display = 'flex';
    
    const savedGames = JSON.parse(localStorage.getItem('golf_scores')) || [];
    
    if (savedGames.length === 0) {
        savedGamesListDiv.innerHTML = '<p>저장된 경기 기록이 없습니다.</p>';
        return;
    }
    
    let html = '<ul>';
    savedGames.forEach(game => {
        const displayDate = new Date(game.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const playerNames = game.players.map(p => p.name).join(', ');
        
        html += `
            <li>
                <span>
                    <strong>날짜:</strong> ${displayDate} <br>
                    <strong>코스:</strong> ${game.courseName} <br>
                    <strong>참석자:</strong> ${playerNames}
                </span>
                <div class="button-group">
                    <button onclick="loadGame(${game.id})">불러오기</button>
                    <button onclick="deleteGame(${game.id})">삭제</button>
                </div>
            </li>
        `;
    });
    html += '</ul>';
    savedGamesListDiv.innerHTML = html;
}

// 기록 목록 화면 닫기
function closeSavedGamesScreen() {
    savedGamesScreen.style.display = 'none';
    mainApp.style.display = 'block';
}

// 기록 불러오기
function loadGame(gameId) {
    const savedGames = JSON.parse(localStorage.getItem('golf_scores')) || [];
    const gameToLoad = savedGames.find(game => game.id === gameId);

    if (gameToLoad) {
        document.getElementById('dateInput').value = gameToLoad.date;
        document.getElementById('courseNameInput').value = gameToLoad.courseName;
        pars = gameToLoad.pars;
        players.length = 0;
        gameToLoad.players.forEach(p => players.push(p));
        
        initializeParTable();
        updateScoreTable();
        alert('경기 기록을 불러왔습니다!');
    } else {
        alert('기록을 찾을 수 없습니다.');
    }
    
    closeSavedGamesScreen();
}

// 기록 삭제하기
function deleteGame(gameId) {
    let savedGames = JSON.parse(localStorage.getItem('golf_scores')) || [];
    const newSavedGames = savedGames.filter(game => game.id !== gameId);
    
    localStorage.setItem('golf_scores', JSON.stringify(newSavedGames));
    alert('기록이 삭제되었습니다.');
    showSavedGames();
}

// 초기 테이블 생성
initializeParTable();
updateScoreTable();