import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();
document.body.innerHTML = '';

function login(email, password, callback) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            callback();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
        });
}
function logout() {
    signOut(auth)
        .catch((error) => {
            console.log(error);
        });
}
const updatePost = (key, title, content, img, detail, uid) => {
    const dataRef = ref(database, 'research/post/' + key);

    set(dataRef, {
        title: title,
        content: content,
        img: img,
        detail: detail,
        permissions: uid
    });
}
const post = (uid = null, title, content, img, detail) => {
    const dataHash = dateutils.ToHash();
    const dataRef = ref(database, 'research/post/' + dataHash);

    set(dataRef, {
        title: title,
        content: content,
        img: img,
        detail: detail,
        permissions: uid
    });
}
// post('DPcmhV427VQNJ9ojiOTD2aYyuE83',
// '插件繪圖工具', 
// 'unity底層開發的插件工具',
// 'https://cdn.discordapp.com/attachments/1298197587584880674/1353299304386793482/color_all.png?ex=67e31ff1&is=67e1ce71&hm=ab9b157472f48981b323a99a2af1c3c7d86060fe60232275393131afcdf211cc&',
// 'ColorPanel插件開發<br>目的: Unity編輯器畫圖。<br>動機: 想畫個小UI物件，打開Photoshop卻很卡，因此就想直接用Unity引擎做出可以畫圖的小工具。');
const autoUpdateData = async () => {
    if (!render.cardContainer.dom()) {
        document.body.innerHTML += render.cardContainer.html();
    }
    const dataRef = ref(database, 'research/post');
    onValue(dataRef, (snapshot) => {
        render.cardContainer.dom().innerHTML = '';
        let data = snapshot.val();
        if (data === null) return render.cardContainer.dom().innerHTML = render.emptyContent.html();
        let dataKeys = Object.keys(data);
        let dataVals = Object.values(data);
        const cardContainer = render.cardContainer.dom();
        for (let i = 0; i < dataKeys.length; i++) {
            const keys = dataKeys[i];
            const permissions = dataVals[i].permissions;
            const title = dataVals[i].title;
            const content = dataVals[i].content;
            const img = dataVals[i].img;
            const detail = dataVals[i].detail;
            cardContainer.innerHTML += render.card.html(keys, title, img, content);
            setTimeout(() => {
                render.card.dom(keys).card.addEventListener('click', () => {
                    if (render.card.dom(keys).card.getAttribute('contenteditable') === 'true') return;
                    if (render.card.dom(keys).detail.innerHTML === '') {
                        render.card.dom(keys).detail.innerHTML = detail;
                    } else {
                        render.card.dom(keys).detail.innerHTML = '';
                    }
                });
                // 底層開發
                if (auth.currentUser !== null && permissions === auth.currentUser.uid) {
                    render.card.dom(keys).card.innerHTML += render.updatePost.html(keys);
                    render.updatePost.dom(keys).addEventListener('click', () => {
                        if (render.card.dom(keys).card.getAttribute('contenteditable') !== 'true') {
                            render.updatePost.dom(keys).textContent = '確認';
                            render.card.dom(keys).card.setAttribute('contenteditable', true);

                            // 圖片連結可視化編輯
                            render.card.dom(keys).img.style.display = 'none';
                            render.card.dom(keys).imgSrc.innerHTML = `${render.card.dom(keys).img.getAttribute('src')}`;
                        } else {
                            render.updatePost.dom(keys).textContent = '修改';
                            render.card.dom(keys).card.setAttribute('contenteditable', false);

                            // 更新
                            updatePost(keys, render.card.dom(keys).title.innerHTML, render.card.dom(keys).content.innerHTML, render.card.dom(keys).imgSrc.innerHTML, render.card.dom(keys).detail.innerHTML, auth.currentUser.uid);

                            // 圖片連結可視化編輯
                            render.card.dom(keys).img.style.display = '';
                            render.card.dom(keys).imgSrc.innerHTML = '';
                        }
                        // 內文
                        render.card.dom(keys).detail.innerHTML = detail;
                    });
                    // 換行更換
                    render.card.dom(keys).card.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            const selection = window.getSelection();
                            if (selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const br = document.createElement('br');
                                range.insertNode(br);
                                range.setStartAfter(br);
                                range.setEndAfter(br);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }
                    });
                }
            });
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
            `;
        },
        dom: () => {
            return document.querySelector('.empty')
        }
    },
    cardContainer: {
        html: () => {
            return `
                <div class="card-container"></div>
            `;
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
                    ${src ? `<img src="${src}" alt="" draggable="false"/><div class="img-src"></div>` : '<img src="Type URL" alt="" draggable="false"/><div class="img-src"></div>'}
                    <div class="content">${content}</div>
                    <div class="detail"></div>
                </div>
            `;
        },
        dom: (id) => {
            return {
                card: document.querySelector(`.card-${id}`),
                detail: document.querySelector(`.card-${id}>.detail`),
                title: document.querySelector(`.card-${id}>.title`),
                content: document.querySelector(`.card-${id}>.content`),
                img: document.querySelector(`.card-${id}>img`),
                imgSrc: document.querySelector(`.card-${id}>.img-src`)
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
                    <div class="container">
                        <div class="login">Login</div>
                        <div class="cancel">Cancel</div>
                    </div>
                </div>
            `;
        },
        dom: () => {
            return {
                authentication: document.querySelector('.authentication'),
                account: document.querySelector('.authentication>.account'),
                password: document.querySelector('.authentication>.password'),
                login: document.querySelector('.authentication>.container>.login'),
                cancel: document.querySelector('.authentication>.container>.cancel')
            }
        }
    },
    admin: {
        html: () => {
            return {
                admin: `
                    <div class="admin">
                        <div class="logout">Logout</div>
                    </div>
                `,
                addPost: `
                    <input type="text" class="add-post" size="10" placeholder="username.." />
                `
            }
        },
        dom: () => {
            return {
                admin: document.querySelector('.admin'),
                logout: document.querySelector('.logout')
            }
        }
    },
    updatePost: {
        html: (id) => {
            return `
                <div class="modify modify-${id}" contenteditable="false">修改</div>
            `;
        },
        dom: (id) => {
            return document.querySelector(`.modify-${id}`);
        }
    }
}
const main = (async () => {
    onAuthStateChanged(auth, (user) => {
        console.log(user);
        const handleAddCardEvent = () => {
            if (!user) {
                if (!render.authentication.dom().authentication) {
                    document.body.innerHTML += render.authentication.html();
                }
                render.authentication.dom().login.addEventListener('click', () => {
                    login(render.authentication.dom().account.value, render.authentication.dom().password.value, () => {
                        render.authentication.dom().authentication.remove();
                        document.body.innerHTML += render.admin.html().admin;
                        render.admin.dom().logout.addEventListener('click', () => {
                            logout();
                            render.admin.dom().admin.remove();
                        });
                    });
                });
                render.authentication.dom().account.addEventListener('input', (e) => {
                    const v = e.target.value;
                    if (v.includes('@') && !v.endsWith('@gmail.com')) {
                        e.target.value = v.split('@')[0] + '@gmail.com';
                        render.authentication.dom().password.focus();
                    }
                });
                render.authentication.dom().cancel.addEventListener('click', async () => {
                    await autoUpdateData();
                    render.authentication.dom().authentication.remove();
                    render.addCard.dom().addEventListener('click', handleAddCardEvent);
                });
            } else {
                document.body.innerHTML += render.admin.html().admin;
                render.admin.dom().logout.addEventListener('click', () => {
                    logout();
                    render.admin.dom().admin.remove();
                });
            }
        }
        render.addCard.dom().addEventListener('click', handleAddCardEvent);
    });
    await autoUpdateData();
    document.body.innerHTML += render.addCard.html();
})();