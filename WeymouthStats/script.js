var players, matches;

document.addEventListener('DOMContentLoaded', () => populatePage());

async function fetchJSON() { //Load all the JSON data and return after it's all loaded
    var r1 = await fetch('players.json'); var d1 = await r1.json();
    var r2 = await fetch('matches.json'); var d2 = await r2.json();
    return players = d1, matches = d2;
}

async function populatePage() {
    await fetchJSON(); //Wait for all the JSON data to load from this function before we do anything else
    if (players) console.log('JSON data loaded');
    buildSidebar();
    buildMatchbar();
    loadPlayer(Math.floor(Math.random() * players.length));
    loadTeamProfile();
}

function buildSidebar(event) {
    const sidebar = document.getElementById('sidebar');
    var newHTML = "", infoHTML = "";
    if (event == null) sort = "position";
    else var sort = event.target.value;

    switch (sort) {
        case "alphabetical": {
            players.sort((a, b) => {
                let fa = a.lastName.toLowerCase(),
                    fb = b.lastName.toLowerCase();
                if (fa < fb) return -1;
                if (fa > fb) return 1;
                return 0;
            });
            break;
        }
        case "position": {
            var ordering = {}, sortOrder = ["gk", "rb", "cb", "lb", "rwb", "dm", "lwb", "rm", "cm", "lm", "rw", "am", "lw", "st"];
            for (var i = 0; i < sortOrder.length; i++) ordering[sortOrder[i]] = i;
            players.sort((a, b) => {
                return (ordering[a.position] - ordering[b.position]) || (a.stats[0].apps.starts + a.stats[0].apps.sub) < (b.stats[0].apps.starts + b.stats[0].apps.sub);
            });
            break;
        }
        case "age": {
            players.sort((a, b) => {
                return a.age - b.age;
            });
            break;
        }
        case "appearances": {
            players.sort((a, b) => {
                return ((a.stats[0].apps.starts + a.stats[0].apps.sub) - (b.stats[0].apps.starts + b.stats[0].apps.sub)) * -1 || a.stats[0].apps.starts < b.stats[0].apps.starts;
            });
            break;
        }
        case "goals": {
            players.sort((a, b) => {
                return (a.stats[0].goals - b.stats[0].goals) * -1;
            });
            break;
        }
        case "assists": {
            players.sort((a, b) => {
                return (a.stats[0].assists - b.stats[0].assists) * -1;
            });
            break;
        }
    }
    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        switch (sort) {
            case "alphabetical":
            case "position":
            case "age": {
                infoHTML = `<span>${player.age}</span>`
                break;
            }
            case "appearances": {
                infoHTML = `<span>Apps: ${player.stats[0].apps.starts}(${player.stats[0].apps.sub})</span>`
                break;
            }
            case "goals": {
                infoHTML = `<span>Goals: ${player.stats[0].goals}</span>`
                break;
            }
            case "assists": {
                infoHTML = `<span>Assists: ${player.stats[0].assists}</span>`
                break;
            }
        }
        newHTML +=
            `<div class='sidebarPlayer' onclick='loadPlayer(${i})'>` +
            `<div class='sidebarPlayerName'>${player.firstName} ${player.lastName}</div>` +
            `<div class='sidebarPlayerInfo'><span class = 'sidebarPlayerInfoPos'>${player.position}</span>-${infoHTML}</div>` +
            "</div>";
    }
    sidebar.innerHTML = newHTML;
    document.getElementById('sidebarSort').selectedIndex = 0;
}

function loadPlayer(index) {
    const player = players[index];
    const playerProfile = document.getElementById('playerProfile');

    var captain = (player.captain ? "<div class='captain'>C</div>" : "")

    var otherPositions = "";
    if (player.otherPositions) {
        for (let i = 0; i < player.otherPositions.length; i++) {
            const a = player.otherPositions[i];
            otherPositions += `<div class='${a} positionMarker otherPosition'>${a}</div>`
        }
    }

    var gkHeaders = "", gkStats = "", statsTableHTML = "";
    if (player.position == "gk") gkHeaders = "<th>Conceded</th><th>Clean Sheets</th>"

    var totalApps = 0, totalAppsSub = 0, totalConceded = 0, totalCleanSheets = 0, totalYellows = 0, totalReds = 0, totalMotm = 0, totalGoals = 0, totalAssists = 0;

    for (let i = 0; i < player.stats.length + 1; i++) {

        if (i >= player.stats.length) {

            if (player.position == "gk") gkStats = `<td>${totalConceded}</td><td>${totalCleanSheets}</td>`

            statsTableHTML +=
                `<tr class='total'>` +
                `<td>Total</td>` +
                `<td>${totalApps}(${totalAppsSub})</td>` +
                gkStats +
                `<td>${totalYellows}</td>` +
                `<td>${totalReds}</td>` +
                `<td>${totalMotm}</td>` +
                `<td>${totalGoals}</td>` +
                `<td>${totalAssists}</td>` +
                `<tr>`;
            continue;
        }
        totalApps += player.stats[i].apps.starts;
        totalAppsSub += player.stats[i].apps.sub;
        totalConceded += player.stats[i].conceded;
        totalCleanSheets += player.stats[i].cleanSheets;
        totalYellows += player.stats[i].yellows;
        totalReds += player.stats[i].reds;
        totalMotm += player.stats[i].motm;
        totalGoals += player.stats[i].goals;
        totalAssists += player.stats[i].assists;

        if (player.position == "gk") gkStats = `<td>${player.stats[i].conceded}</td><td>${player.stats[i].cleanSheets}</td>`

        statsTableHTML +=
            `<tr>` +
            `<td>${player.stats[i].competition}</td>` +
            `<td>${player.stats[i].apps.starts}(${player.stats[i].apps.sub})</td>` +
            gkStats +
            `<td>${player.stats[i].yellows}</td>` +
            `<td>${player.stats[i].reds}</td>` +
            `<td>${player.stats[i].motm}</td>` +
            `<td>${player.stats[i].goals}</td>` +
            `<td>${player.stats[i].assists}</td>` +
            `<tr>`;
    }

    var newHTML =
        `<h2>${player.firstName} ${player.lastName + captain}</h2>` +
        `<img id='playerPic' src='${player.pic}' alt='${player.firstName} ${player.lastName}'>` +
        `<div id='playerInfo'>` +
        `<div><div>Age</div><span>${player.age}</span></div>` +
        `<div><div>Nationality</div><span>${player.nationality}</span></div>` +
        `<div><div>Foot</div><span>${player.foot}</span></div>` +
        `</div>` +
        `<div id='positionGraphic'>` +
        `<div class='${player.position} positionMarker'>${player.position}</div>` +
        otherPositions +
        `</div>` +
        `<div id='stats'>` +
        `<h3>Stats</h3>` +
        `<table><thead><tr>` +
        `<th>Competition</th><th>Apps(sub)</th>${gkHeaders}<th>Yellows</th><th>Reds</th><th>MotM</th><th>Goals</th><th>Assists</th>` +
        `</tr></thead>` +
        `<tbody>` +
        statsTableHTML +
        `</tbody></table>` +
        `</div>`;
    playerProfile.innerHTML = newHTML;
    if (document.getElementById("teamProfileSwitch").classList.contains("selected")) profileSwitch("player");
}
var events
function buildMatchbar() {
    const matchbar = document.getElementById('matchbar')
    var newHTML = "", headerHTML = "", eventsHTML = "", yellowsHTML = ""; futureMatch = true;
    var totalPlayed = 0, totalWins = 0, totalDraws = 0, totalLosses = 0, totalGF = 0, totalGA = 0, totalGD = 0;

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        newHTML = "", headerHTML = "", eventsHTML = "", yellowsHTML = ""; futureMatch = true;

        var matchDate = new Date(match.date);
        if (matchDate < new Date()) futureMatch = false;

        var matchHeaderDivider = futureMatch ? " v " : match.homeScore + " - " + match.awayScore

        if (match.venue == "home") {
            headerHTML =
                `<span class='matchWeymouth'>Weymouth </span>` +
                `<span class='matchScore'>${matchHeaderDivider}</span>` +
                `<span class='matchOpponent'> ${match.opposition}</span>`;
        } else {
            headerHTML =
                `<span class='matchOpponent'>${match.opposition}</span>` +
                `<span class='matchScore'> ${matchHeaderDivider} </span>` +
                `<span class='matchWeymouth'>Weymouth</span>`;
        }
        var comp = (match.competition == "league") ? "National League South" : match.competition
        headerHTML +=
            `<div class='matchComp'>${comp}</div>` +
            `<div class='matchDate'>${matchDate.getDate().toString().padStart(2, '0')}/${matchDate.getMonth().toString().padStart(2, '0')}/${matchDate.getFullYear()} ${matchDate.getHours().toString().padStart(2, '0')}:${matchDate.getMinutes().toString().padStart(2, '0')}</div>`;
        if (!futureMatch) headerHTML += `<div class='matchAttendance'>Attendance: ${match.attendance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>`;

        if (match.events.length > 0 && !futureMatch) {
            totalPlayed++;
            match.events.sort((a, b) => {
                var atime = (a.type == "penMiss") ? a.time - 0.1 : a.time
                var btime = (b.type == "penMiss") ? b.time - 0.1 : b.time
                return atime - btime;
            });
            for (let i = 0; i < match.events.length; i++) {
                const event = match.events[i];
                switch (event.type) {
                    case "goal": {
                        var pen = event.pen ? pen = "(p)" : pen = "";
                        if (match.venue == event.team) eventsHTML += `<div class='matchEvent goal ${event.team}'>${event.time}'${pen} ${getPlayerLink(event.player)}</div>`
                        else eventsHTML += `<div class='matchEvent goal ${event.team}'>${event.time}'${pen} ${event.player}</div>`
                        break;
                    }
                    case "red": {
                        if (match.venue == event.team) eventsHTML += `<div class='matchEvent redCard ${event.team}'>${event.time}' ${getPlayerLink(event.player)}</div>`
                        else eventsHTML += `<div class='matchEvent redCard ${event.team}'>${event.time}' ${event.player}</div>`
                        break;
                    }
                    case "penMiss": {
                        if (match.venue == event.team) eventsHTML += `<div class='matchEvent penMiss ${event.team}'>${event.time}' ${getPlayerLink(event.player)}</div>`
                        else eventsHTML += `<div class='matchEvent penMiss ${event.team}'>${event.time}' ${event.player}</div>`
                        break;
                    }
                }
            }
        }

        if (match.yellows.length > 0 && !futureMatch) {
            yellowsHTML += `<div class='yellowCards'><span>Yellows</span>`;
            for (let i = 0; i < match.yellows.length; i++) {
                const yellow = match.yellows[i];
                if (match.venue == yellow.team) yellowsHTML += `<div class='matchEvent yellowCard ${yellow.team}'>${getPlayerLink(yellow.player)}</div>`
                else yellowsHTML += `<div class='matchEvent yellowCard ${yellow.team}'>${yellow.player}</div>`
            }
            yellowsHTML += `</div>`;
        }

        var resultClass = "";
        if (match.venue == "home") {
            if (match.homeScore > match.awayScore) { resultClass = "matchWin"; totalWins++; }
            if (match.homeScore < match.awayScore) { resultClass = "matchLoss"; totalLosses++; }
            totalGF += match.homeScore; totalGA += match.awayScore; totalGD += (match.homeScore - match.awayScore);
        }
        if (match.venue == "away") {
            if (match.homeScore > match.awayScore) { resultClass = "matchLoss"; totalLosses++; }
            if (match.homeScore < match.awayScore) { resultClass = "matchWin"; totalWins++; }
            totalGF += match.awayScore; totalGA += match.homeScore; totalGD += (match.awayScore - match.homeScore);
        }
        if (match.homeScore == match.awayScore && !futureMatch) { resultClass = "matchDraw"; totalDraws++; }

        if (!futureMatch) var motmHTML = match.motm == "N/A" ? "" : `<div class='motm'>⭐ ${getPlayerLink(match.motm)} ⭐</div>`;

        newHTML =
            `<div class='matchbarMatch ${resultClass}'>` +
            `<div class='matchHeader'>${headerHTML}</div>`;
        if (!futureMatch) {
            newHTML +=
                `<div class='matchInfo hide'>${eventsHTML}` +
                yellowsHTML +
                motmHTML +
                `</div>` +
                `<div class='showMatchInfo' onclick='toggleMatchInfo(event)'><div></div></div>`
        }
        newHTML += `</div>`;

        matchbar.innerHTML += newHTML;
    }
    document.getElementById('totalStats').innerHTML =
        `<span>P:${totalPlayed} </span><span>W:${totalWins} </span><span>D:${totalDraws} </span><span>L:${totalLosses} </span><span>GF:${totalGF} </span><span>GA:${totalGA} </span><span>GD:${totalGD} </span><span>GD:${totalGD} </span>`;
}

function toggleMatchInfo(event) {
    const match = event.target.closest(".matchbarMatch");
    if (!match.querySelector('.matchInfo').classList.contains("matchInfoAnimation")) match.querySelector('.matchInfo').classList.add("matchInfoAnimation");
    match.querySelector('.matchInfo').classList.toggle('hide');
    match.querySelector('.showMatchInfo').classList.toggle("reveal");
}

function getPlayerLink(name) {
    var playerIndex, playerLink

    if (name == "N/A") {
        playerLink = `<span>${name}</span>`
        return playerLink;
    }

    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.lastName.toLowerCase() != name.toLowerCase()) continue;
        else {
            playerIndex = i;
        }
    }
    if (playerIndex === undefined) return console.log(`Bad name: ${name}, index: ${playerIndex}`);
    playerLink = `<span class='playerLink' onclick='loadPlayer(${playerIndex})'>${name}</span>`
    return playerLink;
}

function showBar(bar) {
    switch (bar) {
        case 'sidebar': {
            var sidebar = document.getElementById('sidebarHolder')
            if (!sidebar.classList.contains("reveal")) sidebar.classList.add("reveal")
            else sidebar.classList.remove("reveal")
            break;
        }
        case 'matchbar': {
            var matchbar = document.getElementById('matchbarHolder')
            if (!matchbar.classList.contains("reveal")) matchbar.classList.add("reveal")
            else matchbar.classList.remove("reveal")
            break;
        }
    }
}

function profileSwitch(profile) {
    var playerSwitch = document.getElementById("playerProfileSwitch");
    var teamSwitch = document.getElementById("teamProfileSwitch");
    var playerProfile = document.getElementById("playerProfile");
    var teamProfile = document.getElementById("teamProfile");
    switch (profile) {
        case "player": {
            if (playerSwitch.classList.contains("selected")) break;
            playerSwitch.classList.add("selected"); teamSwitch.classList.remove("selected");
            playerProfile.classList.remove("hide"); teamProfile.classList.add("hide");
            break;
        }
        case "team": {
            if (teamSwitch.classList.contains("selected")) break;
            teamSwitch.classList.add("selected"); playerSwitch.classList.remove("selected");
            teamProfile.classList.remove("hide"); playerProfile.classList.add("hide");
            break;
        }
    }
}

function loadTeamProfile() {
    var teamProfile = document.getElementById("teamHolder")



    for (let i = 0; i < teamProfile.children.length; i++) {
        const pos = teamProfile.children[i];
        var posPlayers = pos.querySelector(".teamPosPlayerHolder");
        var posHTML = "";

        function setPosPlayer(pPos) {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.position == pPos) posHTML += getPlayerLink(player.lastName)
            }
        }

        function setOtherPosPlayer(pPos) {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                var otherPos = player.otherPositions.find(obj => { return obj === pPos })

                if (otherPos) {
                    posHTML += `<span class='otherPosition ${getPlayerLink(player.lastName).slice(13)}`;
                }
            }
        }

        switch (pos.classList[0]) {
            case "blank": { continue; }
            case "st": { setPosPlayer("st"); setOtherPosPlayer("st"); break; }
            case "lw": { setPosPlayer("lw"); setOtherPosPlayer("lw"); break; }
            case "am": { setPosPlayer("am"); setOtherPosPlayer("am"); break; }
            case "rw": { setPosPlayer("rw"); setOtherPosPlayer("rw"); break; }
            case "lm": { setPosPlayer("lm"); setOtherPosPlayer("lm"); break; }
            case "cm": { setPosPlayer("cm"); setOtherPosPlayer("cm"); break; }
            case "rm": { setPosPlayer("rm"); setOtherPosPlayer("rm"); break; }
            case "lwb": { setPosPlayer("lwb"); setOtherPosPlayer("lwb"); break; }
            case "dm": { setPosPlayer("dm"); setOtherPosPlayer("dm"); break; }
            case "rwb": { setPosPlayer("rwb"); setOtherPosPlayer("rwb"); break; }
            case "lb": { setPosPlayer("lb"); setOtherPosPlayer("lb"); break; }
            case "cb": { setPosPlayer("cb"); setOtherPosPlayer("cb"); break; }
            case "rb": { setPosPlayer("rb"); setOtherPosPlayer("rb"); break; }
            case "gk": { setPosPlayer("gk"); setOtherPosPlayer("gk"); break; }
        }
        posPlayers.innerHTML = posHTML;
    }
}