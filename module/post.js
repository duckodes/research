import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import fetcher from "./fetcher.js";

const firebaseConfig = await fetcher.load('../config/firebaseConfig.json');
const app = initializeApp(firebaseConfig);
const database = getDatabase();

const autoUpdateData = async () => {
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
        document.body.innerHTML = render(data);
        console.log(snapshot);
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
await autoUpdateData();
const render = (title) => {
    return `
        <div>This is ${title}</div>
    `;
}