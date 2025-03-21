import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const database = getDatabase();
document.body.innerHTML = `<button class="add-card">+</button>`;

const post = (title, content) => {
    const dataHash = dateutils.ToHash();
    const dataRef = ref(database, 'research/post/' + title + '?id=' + dataHash);

    set(dataRef, content);
}
const autoUpdateData = async () => {
    document.body.innerHTML += render().cardContainer();
    const dataRef = ref(database, 'research/post');
    const getFrontSection = (hash) => {
        const index = hash.indexOf("?id=");
        if (index !== -1) {
            return hash.substring(0, index);
        }
        return hash;
    }
    onValue(dataRef, (snapshot) => {
        document.querySelector('.card-container').innerHTML = '';
        let data = snapshot.val();
        if (data !== null) {
            let dataKeys = Object.keys(data);
            let dataVals = Object.values(data);
            const cardContainer = document.querySelector('.card-container');
            for (let i = 0; i < dataKeys.length; i++) {
                const keys = dataKeys[i].split('?id=')[1];
                const name = getFrontSection(dataKeys[i]);
                const content = dataVals[i];
                cardContainer.innerHTML += render().card(name, content);
            }
        } else {
            document.querySelector('.card-container').innerHTML = render().emptyContent();
        }
    });
    document.querySelector('.add-card').addEventListener('click', () => {
        document.body.innerHTML += render().authentication();
    });
}
const render = () => {
    return {
        emptyContent: () => {
            return `
                <div class="empty">
                    none research
                </div>
            `;
        },
        cardContainer: () => {
            return `
                <div class="card-container"></div>
            `;
        },
        card: (title, content) => {
            return `
                <div class="card">
                    <div class="title">${title}</div>
                    <div class="content">${content}</div>
                </div>
            `;
        },
        authentication: () => {
            return `
                <div class="authentication">
                    <input type="text" class="account" minlength="4" maxlength="8" size="10" />
                    <input type="password" class="password" minlength="4" maxlength="8" size="10" />
                </div>
            `;
        }
    }
}
await autoUpdateData();