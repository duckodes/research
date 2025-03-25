import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); console.log(auth);
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
const updatePost = (key, modifyKey, value) => {
    const dataRef = ref(database, 'research/post/' + key + '/' + modifyKey);

    set(dataRef, value);
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
            let dataVals = Object.values(data);
            const cardContainer = document.querySelector('.card-container');
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
                    if (auth.currentUser !== null && permissions === auth.currentUser.uid) {
                        render.card.dom(keys).card.innerHTML += render.updatePost.html(keys);
                        render.updatePost.dom(keys).modify.addEventListener('click', () => {
                            if (render.card.dom(keys).card.getAttribute('contenteditable') !== 'true') {
                                render.card.dom(keys).card.setAttribute('contenteditable', true);
                                render.card.dom(keys).detail.innerHTML = detail;
                                if (render.card.dom(keys).img) {
                                    render.card.dom(keys).img.setAttribute('style', 'display: none;');
                                    render.card.dom(keys).imgSrc.innerHTML = `${render.card.dom(keys).img.getAttribute('src')}`;
                                }
                                render.updatePost.dom(keys).confirm.setAttribute('style', '');
                                render.updatePost.dom(keys).modify.setAttribute('style', 'display: none;');
                            } else {
                                render.card.dom(keys).card.setAttribute('contenteditable', false);
                                render.card.dom(keys).img.setAttribute('style', '');
                                render.card.dom(keys).imgSrc.innerHTML = '';
                                render.updatePost.dom(keys).confirm.setAttribute('style', 'display: none;');
                                render.updatePost.dom(keys).modify.setAttribute('style', 'display: none;');
                            }
                        });
                        render.updatePost.dom(keys).confirm.addEventListener('click', () => {
                            updatePost(keys, 'title', render.card.dom(keys).title.textContent);
                            updatePost(keys, 'content', render.card.dom(keys).content.textContent);
                            updatePost(keys, 'detail', render.card.dom(keys).detail.textContent);
                        });
                    }
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
                    ${src ? `<img src="${src}" alt="" draggable="false"/><div class="img-src"></div>` : ''}
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
                <div class="modify-${id}" contenteditable="false">Modify</div>
                <div class="confirm-${id}" contenteditable="false" style="display: none;">Confirm</div>
            `;
        },
        dom: (id) => {
            return {
                modify: document.querySelector(`.modify-${id}`),
                confirm: document.querySelector(`.confirm-${id}`)
            }
        }
    }
}
const main = (async () => {
    onAuthStateChanged(auth, (user) => {
        console.log(user);
        const handleAddCardEvent = () => {
            if (!user) {
                document.body.innerHTML += render.authentication.html();
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