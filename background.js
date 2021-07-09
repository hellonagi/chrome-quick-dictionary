// Fires when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    pages: [
      {
        id: 'camee',
        name: 'Cambridge Dictionary E-E',
        url: 'https://dictionary.cambridge.org/dictionary/english/',
        open: true,
      },
      {
        id: 'lmee',
        name: 'Longman Dictionary E-E',
        url: 'https://www.ldoceonline.com/dictionary/',
        open: true,
      },
      {
        id: 'webej',
        name: 'Weblio英和辞典',
        url: 'https://ejje.weblio.jp/content/',
        open: true,
      },
      {
        id: 'gimg',
        name: 'Google画像検索',
        url: 'https://www.google.com/search?tbm=isch&q=',
        open: true,
      },
      {
        id: 'yt',
        name: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=',
        open: false,
      },
      {
        id: 'tw',
        name: 'Twitter',
        url: 'https://twitter.com/search?q=',
        open: false,
      },
    ],
    diffs: [
      {
        id: 'gd',
        name: 'Google検索',
        url: 'https://www.google.com/search?&q=',
        open: true,
      },
      {
        id: 'hnd',
        name: 'HiNative',
        url: 'https://hinative.com/search/questions?language_id=22&q=',
        open: true,
      },
    ],
    historyNum: 30,
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'open_tabs') {
    chrome.storage.local.get('pages', (res) => {
      if (chrome.runtime.lastError) {
        sendResponse({ message: 'fail' })
        return
      }
      res.pages.forEach((page) => {
        if (page.open) {
          chrome.tabs.create({
            url: `${page.url}${request.payload}`,
            active: false,
          })
        }
      })
      sendResponse({ message: 'success' })
    })
    return true
  } else if (request.message === 'open_diffs') {
    chrome.storage.local.get('diffs', (res) => {
      if (chrome.runtime.lastError) {
        sendResponse({ message: 'fail' })
        return
      }
      res.diffs.forEach((page) => {
        if (page.open) {
          chrome.tabs.create({
            url: `${page.url}${request.payload.word1}+${request.payload.word2}+difference`,
            active: false,
          })
        }
      })
      sendResponse({ message: 'success' })
    })
    return true
  } else if (request.message === 'open_options') {
    chrome.tabs.create({
      url: 'options.html',
    })
    sendResponse({ message: 'success' })
  } else if (request.message === 'init_pages') {
    sendResponse({ message: 'success' })
  }
})

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'options.html',
  })
})
