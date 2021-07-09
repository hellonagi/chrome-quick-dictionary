const changeDict = (arr, target, key) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === target.id) {
      arr[i].open = target.checked
    }
  }
  chrome.storage.local.set({
    [key]: arr,
  })
}

const clickHandler = (e) => {
  chrome.storage.local.get(['pages', 'diffs'], (res) => {
    if (e.target.parentNode.parentNode.id === 'dictList') {
      changeDict(res.pages, e.target, 'pages')
    } else if (e.target.parentNode.parentNode.id === 'diffList') {
      changeDict(res.diffs, e.target, 'diffs')
    }
  })
}

const deleteHistory = (e) => {
  e.stopPropagation()
  chrome.storage.local.get('history', (res) => {
    for (let i = 0; i < res.history.length; i++) {
      if (
        res.history[i].word1 ===
        e.target.parentNode.querySelector('.word1').innerHTML
      ) {
        e.target.parentNode.remove()
        res.history.splice(i, 1)
        chrome.storage.local.set({ history: res.history })
        break
      }
    }
  })
}

const addList = (page) => {
  const dictBox = document.createElement('li')

  const checkBox = document.createElement('input')
  checkBox.type = 'checkbox'
  checkBox.id = page.id
  checkBox.name = page.id
  checkBox.checked = page.open
  checkBox.onclick = clickHandler
  const label = document.createElement('label')
  label.htmlFor = page.id
  label.innerHTML = page.name

  dictBox.appendChild(checkBox)
  dictBox.appendChild(label)
  return dictBox
}

const openDictDiff = (e) => {
  const type = e.currentTarget.querySelector('.type').innerHTML
  const word1 = e.currentTarget.querySelector('.word1').innerHTML
  const word2 = e.currentTarget.querySelector('.word2').innerHTML
  console.log(e.currentTarget.querySelector('.word1').innerHTML)
  if (type === 'dict') {
    chrome.runtime.sendMessage({ message: 'open_tabs', payload: word1 })
  } else if (type === 'diff') {
    chrome.runtime.sendMessage({
      message: 'open_diffs',
      payload: { word1: word1, word2: word2 },
    })
  }
}

const addHistory = (history) => {
  const histBox = document.createElement('li')
  histBox.onclick = openDictDiff

  const type = document.createElement('div')
  type.className = 'type'
  type.innerHTML = history.type

  const word1 = document.createElement('div')
  word1.className = 'word1'
  word1.innerHTML = history.word1

  const word2 = document.createElement('div')
  word2.className = 'word2'
  word2.innerHTML = history.word2

  const date = document.createElement('div')
  date.className = 'date'
  date.innerHTML = history.date

  const deleteIcon = document.createElement('img')
  deleteIcon.id = 'deleteIcon'
  deleteIcon.src = './images/clear_black_24dp.svg'
  deleteIcon.width = 20
  deleteIcon.height = 20
  deleteIcon.onclick = deleteHistory

  histBox.appendChild(type)
  histBox.appendChild(word1)
  histBox.appendChild(word2)
  histBox.appendChild(date)
  histBox.appendChild(deleteIcon)

  return histBox
}

const getHistoryNum = (e) => {
  chrome.storage.local.set({
    historyNum: e.target.value,
  })

  const maxNum = document.querySelector('#maxNum')
  maxNum.innerHTML = e.target.value
}

const deleteAllHistory = (e) => {
  chrome.storage.local.set({
    history: [],
  })

  const curNum = document.querySelector('#curNum')
  curNum.innerHTML = '0'

  const history = document.querySelector('#history')
  history.innerHTML = ''
}

chrome.runtime.sendMessage({ message: 'init_pages' }, (response) => {
  if (response.message === 'success') {
    const dictList = document.querySelector('#dictList')
    const diffList = document.querySelector('#diffList')
    const histList = document.querySelector('#history')
    const showHistory = document.querySelector('#showHistoryNum')
    const historyNum = document.querySelector('#historyNum')
    const deleteBox = document.querySelector('#deleteBox')
    historyNum.onchange = getHistoryNum
    deleteBox.onclick = deleteAllHistory

    chrome.storage.local.get(
      ['pages', 'diffs', 'history', 'historyNum'],
      (res) => {
        res.pages.forEach((page) => {
          const dictBox = addList(page)
          dictList.appendChild(dictBox)
        })

        res.diffs.forEach((page) => {
          const dictBox = addList(page)
          diffList.appendChild(dictBox)
        })

        res.history.reverse().forEach((hist) => {
          const histBox = addHistory(hist)
          histList.appendChild(histBox)
        })

        if (res.history.length === 0) {
          deleteBox.remove()
        }

        // set default selected
        for (let i = 0; i < historyNum.children.length; i++) {
          if (historyNum.children[i].value === res.historyNum) {
            historyNum.children[i].selected = true
            break
          }
        }

        // add xx / xx
        const curNum = document.createElement('span')
        curNum.id = 'curNum'
        curNum.innerHTML = res.history.length
        const slash = document.createElement('span')
        slash.innerHTML = ' / '
        const maxNum = document.createElement('span')
        maxNum.id = 'maxNum'
        maxNum.innerHTML = res.historyNum

        showHistory.appendChild(curNum)
        showHistory.appendChild(slash)
        showHistory.appendChild(maxNum)
      }
    )
  }
})
