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
        permissions: uid,
        time: dateutils.ToDateTime()
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
        permissions: uid,
        time: dateutils.ToDateTime()
    });
}
// post('DPcmhV427VQNJ9ojiOTD2aYyuE83',
// '插件繪圖工具', 
// '<div style="color: #f06785;">unity底層開發的插件工具</div>',
// 'https://lib.duckode.com/img/research/color_all.png',
// 'ColorPanel插件開發<br>目的: Unity編輯器畫圖。<br>動機: 想畫個小UI物件，打開Photoshop卻很卡，因此就想直接用Unity引擎做出可以畫圖的小工具。');
const autoUpdateData = async () => {
    document.body.insertAdjacentHTML('beforeend', render.cardContainer.html());
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
            const time = dataVals[i].time;
            // 所有人
            cardContainer.insertAdjacentHTML('beforeend', render.card.html(keys, title, img, content, time));
            setTimeout(() => {
                render.card.dom(keys).card.addEventListener('click', () => {
                    if (render.card.dom(keys).card.getAttribute('contenteditable') === 'true') return;
                    if (render.card.dom(keys).detail.textContent === '') {
                        render.card.dom(keys).detail.innerHTML = detail;
                    } else {
                        render.card.dom(keys).detail.innerHTML = '';
                    }
                });
                // 編輯
                if (auth.currentUser !== null && permissions === auth.currentUser.uid) {
                    render.card.dom(keys).card.insertAdjacentHTML('afterbegin', render.updatePost.html(keys));
                    render.updatePost.dom().domID(keys).addEventListener('click', () => {
                        if (render.card.dom(keys).card.getAttribute('contenteditable') !== 'true') {
                            render.updatePost.dom().domID(keys).textContent = '✔';
                            render.card.dom(keys).card.setAttribute('contenteditable', true);

                            // 圖片連結可視化編輯
                            render.card.dom(keys).img.style.display = 'none';
                            render.card.dom(keys).imgSrc.innerHTML = `${render.card.dom(keys).img.getAttribute('src')}`;
                        } else {
                            render.updatePost.dom().domID(keys).textContent = '✐';
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
                        if (event.key === 'Backspace' || (event.ctrlKey && (event.key === 'x' || event.key === 'X'))) {
                            const selection = window.getSelection();
                            const activeElement = document.activeElement.querySelector('*'); // 獲取當前編輯的元素

                            if (activeElement) {
                                const isContentEmpty = activeElement.innerHTML.trim() === ''; // 判斷編輯內容是否為空

                                if (isContentEmpty) {
                                    event.preventDefault(); // 阻止刪除操作
                                    return; // 不再執行後續邏輯
                                }
                            }

                            if (selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const startContainer = range.startContainer;
                                const endContainer = range.endContainer;

                                // 檢查是否跨越多個節點
                                if (startContainer !== endContainer) {
                                    event.preventDefault(); // 阻止刪除操作
                                } else {
                                    // 如果選取範圍內包含 HTML 結構，才阻止刪除
                                    const parentElement = startContainer.nodeType === Node.TEXT_NODE
                                        ? startContainer.parentNode
                                        : startContainer;

                                    if (parentElement && parentElement.nodeType === Node.ELEMENT_NODE) {
                                        const rangeContents = range.cloneContents();
                                        const hasHtmlElements = rangeContents.querySelector('*') !== null; // 檢查範圍內是否包含 HTML 元素

                                        if (hasHtmlElements) {
                                            event.preventDefault(); // 阻止刪除 HTML 結構
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            });
            // 自己
            render.addCard.dom().addEventListener('click', () => {
                if (permissions === auth.currentUser.uid && !render.admin.dom().card(keys).card) {
                    render.admin.dom().myCard.insertAdjacentHTML('beforeend', render.card.html(keys, title, img, content, time));
                    setTimeout(() => {
                        render.admin.dom().card(keys).card.addEventListener('click', () => {
                            if (render.admin.dom().card(keys).card.getAttribute('contenteditable') === 'true') return;
                            if (render.admin.dom().card(keys).detail.textContent === '') {
                                render.admin.dom().card(keys).detail.innerHTML = detail;
                            } else {
                                render.admin.dom().card(keys).detail.innerHTML = '';
                            }
                        });
                        // 編輯
                        if (auth.currentUser !== null && !render.updatePost.dom().myDomID(keys)) {
                            render.admin.dom().card(keys).card.insertAdjacentHTML('afterbegin', render.updatePost.html(keys));
                            render.updatePost.dom().myDomID(keys).addEventListener('click', () => {
                                if (render.admin.dom().card(keys).card.getAttribute('contenteditable') !== 'true') {
                                    render.updatePost.dom().myDomID(keys).textContent = '✔';
                                    render.admin.dom().card(keys).card.setAttribute('contenteditable', true);

                                    // 圖片連結可視化編輯
                                    console.log(render.admin.dom().card(keys).img);
                                    render.admin.dom().card(keys).img.style.display = 'none';
                                    render.admin.dom().card(keys).imgSrc.innerHTML = `${render.card.dom(keys).img.getAttribute('src')}`;
                                } else {
                                    render.updatePost.dom().myDomID(keys).textContent = '✐';
                                    render.admin.dom().card(keys).card.setAttribute('contenteditable', false);

                                    // 更新
                                    updatePost(keys, render.admin.dom().card(keys).title.innerHTML, render.admin.dom().card(keys).content.innerHTML, render.admin.dom().card(keys).imgSrc.innerHTML, render.admin.dom().card(keys).detail.innerHTML, auth.currentUser.uid);

                                    // 圖片連結可視化編輯
                                    render.admin.dom().card(keys).img.style.display = '';
                                    render.admin.dom().card(keys).img.setAttribute('src', render.admin.dom().card(keys).imgSrc.textContent);
                                    render.admin.dom().card(keys).imgSrc.innerHTML = '';
                                }
                                // 內文
                                render.admin.dom().card(keys).detail.innerHTML = detail;
                            });
                            // 換行更換
                            render.admin.dom().card(keys).card.addEventListener('keydown', (event) => {
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
                                if (event.key === 'Backspace' || (event.ctrlKey && (event.key === 'x' || event.key === 'X'))) {
                                    const selection = window.getSelection();
                                    const activeElement = document.activeElement.querySelector('*'); // 獲取當前編輯的元素

                                    if (activeElement) {
                                        const isContentEmpty = activeElement.innerHTML.trim() === ''; // 判斷編輯內容是否為空

                                        if (isContentEmpty) {
                                            event.preventDefault(); // 阻止刪除操作
                                            return; // 不再執行後續邏輯
                                        }
                                    }

                                    if (selection.rangeCount > 0) {
                                        const range = selection.getRangeAt(0);
                                        const startContainer = range.startContainer;
                                        const endContainer = range.endContainer;

                                        // 檢查是否跨越多個節點
                                        if (startContainer !== endContainer) {
                                            event.preventDefault(); // 阻止刪除操作
                                        } else {
                                            // 如果選取範圍內包含 HTML 結構，才阻止刪除
                                            const parentElement = startContainer.nodeType === Node.TEXT_NODE
                                                ? startContainer.parentNode
                                                : startContainer;

                                            if (parentElement && parentElement.nodeType === Node.ELEMENT_NODE) {
                                                const rangeContents = range.cloneContents();
                                                const hasHtmlElements = rangeContents.querySelector('*') !== null; // 檢查範圍內是否包含 HTML 元素

                                                if (hasHtmlElements) {
                                                    event.preventDefault(); // 阻止刪除 HTML 結構
                                                }
                                            }
                                        }
                                    }
                                }
                            });
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
        html: (id, title, src, content, time) => {
            return `
                <div class="card card-${id}">
                    <div class="title">${title}</div>
                    ${src ? `<img src="${src}" alt="" draggable="false"/><div class="img-src"></div>` : '<img src="Type URL" alt="" draggable="false"/><div class="img-src"></div>'}
                    <div class="content">${content}</div>
                    <div class="detail"></div>
                    <div class="time" contenteditable="false">${time}</div>
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
                <div class="add-card">⤫</div>
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
                        <div class="home">⤫</div>
                        <input type="text" class="title" placeholder="title.."/>
                        <input type="text" class="img-url" placeholder="image url.."/>
                        <input type="text" class="content" placeholder="content.."/>
                        <input type="text" class="detail" placeholder="detail.."/>
                        <div class="upload">上傳</div>
                        <div class="my-card"></div>
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
                logout: document.querySelector('.admin>.logout'),
                home: document.querySelector('.admin>.home'),
                title: document.querySelector('.admin>.title'),
                imgUrl: document.querySelector('.admin>.img-url'),
                content: document.querySelector('.admin>.content'),
                detail: document.querySelector('.admin>.detail'),
                upload: document.querySelector('.admin>.upload'),
                myCard: document.querySelector('.admin>.my-card'),
                card: (id) => {
                    return {
                        card: document.querySelector(`.admin>.my-card>.card-${id}`),
                        detail: document.querySelector(`.admin>.my-card>.card-${id}>.detail`),
                        content: document.querySelector(`.admin>.my-card>.card-${id}>.content`),
                        title: document.querySelector(`.admin>.my-card>.card-${id}>.title`),
                        img: document.querySelector(`.admin>.my-card>.card-${id}>img`),
                        imgSrc: document.querySelector(`.admin>.my-card>.card-${id}>.img-src`),
                    }
                }
            }
        }
    },
    updatePost: {
        html: (id) => {
            return `
                <div class="modify modify-${id}" contenteditable="false">✐</div>
            `;
        },
        dom: () => {
            return {
                domID: (id) => {
                    return document.querySelector(`.card-${id}>.modify-${id}`);
                },
                dom: document.querySelectorAll('.modify'),
                myDomID: (id) => {
                    return document.querySelector(`.my-card>.card>.modify-${id}`);
                }
            }
        }
    }
}
const main = (async () => {
    onAuthStateChanged(auth, (user) => {
        console.log(user);
        // 檢查金鑰
        window.addEventListener('focus', () => {
            if (!user) return;
            user.getIdToken().catch((error) => {
                console.log(error);
                confirm('登入過期');
                location.reload();
            });
        });
        if (!user) {
            // 註冊登入按鈕
            render.addCard.dom().addEventListener('click', () => {
                // 登入介面
                document.body.insertAdjacentHTML('beforeend', render.authentication.html());
                render.authentication.dom().login.addEventListener('click', () => {
                    login(render.authentication.dom().account.value, render.authentication.dom().password.value, async () => {
                        location.reload();
                    });
                });
                render.authentication.dom().account.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        login(render.authentication.dom().account.value, render.authentication.dom().password.value, async () => {
                            location.reload();
                        });
                    }
                });
                render.authentication.dom().password.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        login(render.authentication.dom().account.value, render.authentication.dom().password.value, async () => {
                            location.reload();
                        });
                    }
                });
                render.authentication.dom().account.addEventListener('input', (e) => {
                    const v = e.target.value;
                    if (v.includes('@') && !v.endsWith('@gmail.com')) {
                        e.target.value = v.split('@')[0] + '@gmail.com';
                        render.authentication.dom().password.focus();
                    }
                });
                render.authentication.dom().cancel.addEventListener('click', () => {
                    render.authentication.dom().authentication.remove();
                });
            });
        } else {
            render.addCard.dom().addEventListener('click', () => {
                document.body.insertAdjacentHTML('beforeend', render.admin.html().admin);
                // 登出
                render.admin.dom().logout.addEventListener('click', () => {
                    logout();
                    render.admin.dom().admin.remove();
                    render.addCard.dom().remove();
                    document.body.insertAdjacentHTML('beforeend', render.addCard.html());
                    render.updatePost.dom().dom.forEach(e => {
                        e.remove();
                    });
                });
                render.admin.dom().home.addEventListener('click', () => {
                    render.admin.dom().admin.remove();
                });
                render.admin.dom().upload.addEventListener('click', () => {
                    post(user.uid, render.admin.dom().title.value, render.admin.dom().content.value, render.admin.dom().imgUrl.value, render.admin.dom().detail.value);
                });
            });
        }
    });
    await autoUpdateData();
    document.body.insertAdjacentHTML('beforeend', render.addCard.html());
})();