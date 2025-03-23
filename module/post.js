import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();
document.body.innerHTML = '';

function login(auth, email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
        });
}
function logout(auth) {
    signOut(auth)
        .catch((error) => {
            console.log(error);
        });
}
const post = (title, content, img, detail) => {
    const dataHash = dateutils.ToHash();
    const dataRef = ref(database, 'research/post/' + dataHash);

    set(dataRef, {
        title: title,
        content: content,
        img: img,
        detail: detail
    });
}
// post('插件繪圖工具', 
// 'unity底層開發的插件工具',
// 'https://cdn.discordapp.com/attachments/1298197587584880674/1353299304386793482/color_all.png?ex=67e125b1&is=67dfd431&hm=707d2a3aa0821e7ac373a47880af23da1465550b94a23e9cb14d68de7c692478&',
// 'ColorPanel插件開發<br>目的: Unity編輯器畫圖。<br>動機: 想畫個小UI物件，打開Photoshop卻很卡，因此就想直接用Unity引擎做出可以畫圖的小工具。');
const autoUpdateData = async () => {
    document.body.innerHTML += render.cardContainer.html();
    const dataRef = ref(database, 'research/post');
    onValue(dataRef, (snapshot) => {
        document.querySelector('.card-container').innerHTML = '';
        let data = snapshot.val();
        if (data !== null) {
            let dataKeys = Object.keys(data);
            let dataVals = Object.values(data); console.log(dataVals);
            const cardContainer = document.querySelector('.card-container');
            for (let i = 0; i < dataKeys.length; i++) {
                const keys = dataKeys[i];
                const title = dataVals[i].title;
                const content = dataVals[i].content;
                const img = dataVals[i].img;
                const detail = dataVals[i].detail;
                cardContainer.innerHTML += render.card.html(keys, title, img, content);
                setTimeout(() => {
                    render.card.dom(keys).card.addEventListener('click', () => {
                        if (render.card.dom(keys).detail.innerHTML === '') {
                            render.card.dom(keys).detail.innerHTML = detail;
                        } else {
                            render.card.dom(keys).detail.innerHTML = '';
                        }
                    });
                });
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
        html: (id, title, src, content) => {
            return `
                <div class="card card-${id}">
                    <div class="title">${title}</div>
                    ${src ? `<img src="${src}" alt="" draggable="false"/>` : ''}
                    <div class="content">${content}</div>
                    <div class="detail"></div>
                </div>
            `;
        },
        dom: (id) => {
            return {
                card: document.querySelector(`.card-${id}`),
                detail: document.querySelector(`.card-${id}>.detail`)
            }
        }
    },
    addCard: {
        html: () => {
            return `
                <div class="add-card">+</div>
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
            return {
                authentication: document.querySelector('.authentication'),
                account: document.querySelector('.account'),
                password: document.querySelector('.password'),
                login: document.querySelector('.login')
            }
        }
    },
    admin: {
        html: () => {
            return {
                admin: `
                    <div class="admin"></div>
                `,
                addPost: `
                    <input type="text" class="add-post" size="10" placeholder="username.." />
                `
            }
        },
        dom: () => {
            return {
                admin: document.querySelector('.admin')
            }
        }
    }
}
const main = (async () => {
    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        console.log(user);
        document.body.innerHTML += render.admin.html().admin;
    });
    await autoUpdateData();
    document.body.innerHTML += render.addCard.html();
    render.addCard.dom().addEventListener('click', () => {
        document.body.innerHTML += render.authentication.html();
        render.authentication.dom().login.addEventListener('click', () => {
            login(auth, render.authentication.dom().account.value, render.authentication.dom().password.value);
        });
        render.authentication.dom().account.addEventListener('input', (e) => {
            const v = e.target.value;
            if (v.includes('@') && !v.endsWith('@gmail.com')) {
                e.target.value = v.split('@')[0] + '@gmail.com';
                render.authentication.dom().password.focus();
            }
        });
    });
})();