import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const database = getDatabase();
document.body.innerHTML = '';

const post = (title, content) => {
    const dataHash = dateutils.ToHash();
    const dataRef = ref(database, 'research/post/' + title + '?id=' + dataHash);

    set(dataRef, content);
}
const autoUpdateData = async () => {
    document.body.innerHTML += render.cardContainer.html();
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
                cardContainer.innerHTML += render.card.html(name, content);
            }
        } else {
            document.querySelector('.card-container').innerHTML = render.emptyContent.html();
        }
    });
}
const render = {
    emptyContent: {
        html: () => {
            return `
                <div class="empty">
                    none research
                </div>
            `
        },
        dom: () => {
            return document.querySelector('.empty')
        }
    },
    cardContainer: {
        html: () => {
            return `
                <div class="card-container"></div>
            `
        },
        dom: () => {
            return document.querySelector('.card-container')
        }
    },
    card: {
        html: (title, content) => {
            return `
                <div class="card">
                    <div class="title">${title}</div>
                    <div class="content">${content}</div>
                </div>
            `;
        },
        dom: () => {
            return document.querySelector('.card');
        }
    },
    addCard: {
        html: () => {
            return `
                <div class="add-card">
                    +
                </div>
            `;
        },
        dom: () => {
            return document.querySelector('.add-card');
        }
    },
    authentication: {
        html: () => {
            return `
                <div class="authentication">
                    <input type="text" class="account" size="10" placeholder="username.." />
                    <input type="password" class="password" size="10" placeholder="password.." />
                    <div class="login">Login</div>
                </div>
            `;
        },
        dom: () => {
            return document.querySelector('.authentication');
        }
    }
}
const main = (async () => {
    await autoUpdateData();
    document.body.innerHTML += render.addCard.html();
    render.addCard.dom().addEventListener('click', () => {
        document.body.innerHTML += render.authentication.html();
    });
})();