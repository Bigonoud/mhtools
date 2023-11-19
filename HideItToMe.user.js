// ==UserScript==
// @name         HideItToMe
// @version      1.0
// @description  Hide messages you don't want to see
// @author       Bigonoud
// @match        *://myhordes.de/*
// @match        *://myhordes.eu/*
// @match        *://myhord.es/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myhordes.eu
// @downloadURL  https://github.com/Bigonoud/mhtools/raw/master/HideItToMe.user.js
// @updateURL    https://github.com/Bigonoud/mhtools/raw/master/HideItToMe.user.js
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

const texts = {
    add_ban_title: {
        en: `I don't want to see the messages from this user anymore.`,
        fr: `Je ne veux plus voir les messages de cet utilisateur.`,
        de: `I don't want to see the messages from this user anymore.`,
        es: `I don't want to see the messages from this user anymore.`
    },
    remove_ban_title: {
        en: `I want to unlock this user and see its messages.`,
        fr: `Je veux débloquer cet utilisateur et voir ses messages.`,
        de: `I want to unlock this user and see its messages.`,
        es: `I want to unlock this user and see its messages.`
    },
    collapsor_text: {
        en: `Masked message (you can click to see it)`,
        fr: `Message masqué (cliquer pour le voir)`,
        de: `Masked message (you can click to see it)`,
        es: `Masked message (you can click to see it)`
    }
};

const gm_banned_ppl_key = 'banned_ppl';
const lang = document.getElementsByTagName('html')[0]?.attributes.lang.value ?? 'en';

let bannedPpl;
GM.getValue(gm_banned_ppl_key).then((params) => {
    bannedPpl = params ? JSON.parse(params) : [];
});

function hideMessages() {
    let messages = Array.from(document.querySelectorAll("div[x-post-content-author-id]"));

    if (bannedPpl?.length > 0 && messages.length > 0) {
        messages = messages.filter((elem) => bannedPpl.includes(elem.getAttribute('x-post-content-author-id')));

        messages.forEach((message) => {
            const collapsor = document.createElement('div');
            collapsor.className = 'collapsor';
            collapsor.setAttribute('data-processed', '1');
            collapsor.setAttribute('data-open', '0');
            collapsor.setAttribute('data-transition', '1');
            collapsor.textContent = texts.collapsor_text[lang];

            const collapsedContent = document.createElement('div');
            collapsedContent.className = 'collapsed';
            collapsedContent.style.opacity = '0';
            collapsedContent.style.maxHeight = '0';

            const existingContent = message.innerHTML;
            collapsedContent.innerHTML = existingContent;

            message.innerHTML = '';
            message.appendChild(collapsor);
            message.appendChild(collapsedContent);

            collapsor.addEventListener('click', () => {
                if (collapsor.getAttribute('data-open') == '1') {
                    collapsor.setAttribute('data-open', '0');
                    collapsedContent.style.maxHeight = '0';
                    collapsedContent.style.opacity = '0';
                }
                else {
                    collapsor.setAttribute('data-open', '1');
                    collapsedContent.style.maxHeight = null;
                    collapsedContent.style.opacity = '1';
                }
            });
        });
    }
}

function showMessages(userId) {
    let messages = Array.from(document.querySelectorAll("div[x-post-content-author-id]"));

    if (messages.length > 0) {
        messages = messages.filter((elem) => elem.getAttribute('x-post-content-author-id') == userId);

        messages.forEach((message) => {
            message.innerHTML = message.getElementsByClassName('collapsed')[0].innerText;
        });
    }
}

function addBanButtons() {
    let messages = Array.from(document.getElementsByClassName('forum-post-header'));

    if (messages.length > 0) {
        messages.forEach((message) => {
            const userName = message.getElementsByClassName('username')[0];

            if (userName) {
                const userId = userName.getAttribute('x-user-id');

                if (userId) {
                    const addBan = document.createElement('span');
                    addBan.title = texts.add_ban_title[lang];
                    addBan.className = 'material-symbols-outlined';
                    addBan.style.paddingLeft = '5px';
                    addBan.style.fontSize = '14px';
                    addBan.style.cursor = 'pointer';
                    addBan.textContent = 'block';

                    addBan.addEventListener('click', () => {
                        bannedPpl.push(userId);
                        GM.setValue(gm_banned_ppl_key, JSON.stringify(bannedPpl));
                        addBan.remove();
                        userName.after(removeBan);
                        hideMessages();
                    });

                    const removeBan = document.createElement('span');
                    removeBan.title = texts.remove_ban_title[lang];
                    removeBan.className = 'material-symbols-outlined';
                    removeBan.style.paddingLeft = '5px';
                    removeBan.style.fontSize = '14px';
                    removeBan.style.cursor = 'pointer';
                    removeBan.textContent = 'cancel';

                    removeBan.addEventListener('click', () => {
                        bannedPpl = bannedPpl.filter((value) => value != userId);
                        GM.setValue(gm_banned_ppl_key, JSON.stringify(bannedPpl));
                        removeBan.remove();
                        userName.after(addBan);
                        showMessages(userId);
                    });

                    if (!bannedPpl.includes(userId)) {
                        userName.after(addBan);
                    } else {
                        userName.after(removeBan);
                    }
                }
            }
        });
    }
}

(function() {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';

    document.addEventListener('mh-navigation-complete', () => {
        if (document.URL.indexOf('forum') > -1) {
            addBanButtons();
            hideMessages();
        }
    });
})();
