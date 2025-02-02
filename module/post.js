import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
const post = (() => {
    async function autoUpdateData(database, languageData) {
        const dataRef = ref(database, 'duckode/comments/public');
        const getFrontSection = (hash) => {
            const index = hash.indexOf("?id=");
            if (index !== -1) {
                return hash.substring(0, index);
            }
            return hash;
        }
        onValue(dataRef, (snapshot) => {
            document.querySelector('#comments').innerHTML = languageData.comments.comments;
            let data = snapshot.val();
            if (data !== null) {
                let dataKeys = Object.keys(data);
                let dataVals = Object.values(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    const keys = dataKeys[i].split('?id=')[1];
                    const name = getFrontSection(dataKeys[i]);
                    const comment = dataVals[i];
                    const commentsContainer = render(name, comment);
                    setTimeout(() => {
                        let localUserData = JSON.parse(localStorage.getItem('ANONYMOUS_USER_DATA')) || [];
                        localUserData.includes(dataKeys[i]) && renderDeleteButton(database, dataKeys, i, commentsContainer, localUserData, languageData);
                    }, 200);
                }
            }
        });
    }
    return {
        init: async (languageData) => {
            const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
            const app = initializeApp(firebaseConfig);
            const database = getDatabase();

            const name = document.getElementById('name');
            const textarea = document.getElementById('textarea');
            const btnStatus = document.getElementById('btn-status');
            const post = document.getElementById('post');
            const errorNameTxt = document.getElementById('error-name-txt');
            const errorTextareaTxt = document.getElementById('error-textarea-txt');

            const statusStruct = {
                public: languageData.contact.public,
                private: languageData.contact.private
            }
            let status = statusStruct.public;

            btnStatus.addEventListener('click', () => {
                if (status === statusStruct.public) {
                    status = statusStruct.private;
                    btnStatus.style.color = '#f36f6f';
                } else {
                    status = statusStruct.public;
                    btnStatus.style.color = '';
                }
                btnStatus.textContent = status;
            });
            post.addEventListener('click', () => {
                status === statusStruct.public ?
                    postPublicData(database, name, textarea, errorNameTxt, errorTextareaTxt, languageData) :
                    postPrivateData(database, name, textarea, errorNameTxt, errorTextareaTxt, languageData);
            });
            autoUpdateData(database, languageData);
        }
    }
})();