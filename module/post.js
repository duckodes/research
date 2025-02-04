import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import fetcher from "./fetcher.js";
const post = (() => {
    async function autoUpdateData(database) {
        const dataRef = ref(database, 'research/post');
        const getFrontSection = (hash) => {
            const index = hash.indexOf("?id=");
            if (index !== -1) {
                return hash.substring(0, index);
            }
            return hash;
        }
        onValue(dataRef, (snapshot) => {
            let data = snapshot.val();
            if (data !== null) {
                let dataKeys = Object.keys(data);
                let dataVals = Object.values(data);
                for (let i = 0; i < dataKeys.length; i++) {
                    const keys = dataKeys[i].split('?id=')[1];
                    const name = getFrontSection(dataKeys[i]);
                    const comment = dataVals[i];
                }
            }
        });
    }
    return {
        init: async () => {
            const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
            const app = initializeApp(firebaseConfig);
            const database = getDatabase();

            autoUpdateData(database);
        }
    }
})();