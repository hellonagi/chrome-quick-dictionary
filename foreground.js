const formatDate = (d) => {
  const month = ('00' + (d.getMonth() + 1)).slice(-2)
  const day = ('00' + d.getDate()).slice(-2)
  const year = d.getFullYear()
  const hour = ('00' + d.getHours()).slice(-2)
  const min = ('00' + d.getMinutes()).slice(-2)

  const formatted = `${year}-${month}-${day} ${hour}:${min}`
  return formatted
}

// add history
const addHistory = (type, word1, word2 = null) => {
  chrome.storage.local.get(['historyNum', 'history'], (res) => {
    if (typeof res.history === 'undefined') {
      chrome.storage.local.set({ history: [] })
    }

    let insertWord = {
      type: type,
      word1: word1,
      word2: word2,
      date: formatDate(new Date()),
    }
    res.history.push(insertWord)
    if (res.history.length > res.historyNum) res.history.shift()
    chrome.storage.local.set({ history: res.history })
  })
}

const checkWord = (e) => {
  const dictButton = document.querySelector('#dictButton')
  const diffButton = document.querySelector('#diffButton')
  const word1 = document.querySelector('#word1')
  const word2 = document.querySelector('#word2')
  if (word1.value.length > 0) {
    dictButton.disabled = false
  } else {
    dictButton.disabled = true
  }

  if (word2.value.length > 0 && word1.value.length > 0) {
    diffButton.disabled = false
  } else {
    diffButton.disabled = true
  }
}

// show word
document.addEventListener('dblclick', (e) => {
  const word = window.getSelection().toString().trim().toLowerCase()
  const rect = window.getSelection().getRangeAt(0).getBoundingClientRect()
  const letters = /^[a-z]+$/

  if (!word) return
  if (!word.match(letters)) return
  if (e.target.tagName.toLowerCase() === 'input') return

  const pupBox = document.createElement('div')
  pupBox.id = 'pupBox'
  pupBox.style.top = rect.bottom + window.scrollY + 10 + 'px'
  pupBox.style.left = rect.left + 'px'

  const labelW1 = document.createElement('div')
  labelW1.id = 'labelW1'
  const labelW2 = document.createElement('div')
  labelW2.id = 'labelW2'

  const word1 = document.createElement('input')
  word1.id = 'word1'
  word1.value = word
  word1.addEventListener('input', checkWord)
  const word2 = document.createElement('input')
  word2.id = 'word2'
  word2.addEventListener('input', checkWord)

  const dictButton = document.createElement('button')
  dictButton.id = 'dictButton'
  dictButton.innerHTML = 'Dict'
  dictButton.addEventListener('click', (e) => {
    const trimmedWord1 = word1.value.trim()

    chrome.runtime.sendMessage(
      { message: 'open_tabs', payload: trimmedWord1 },
      (response) => {
        if (response.message === 'success') {
          addHistory('dict', trimmedWord1)
        }
      }
    )
  })

  const diffButton = document.createElement('button')
  diffButton.id = 'diffButton'
  diffButton.innerHTML = 'Diff'
  diffButton.disabled = true
  diffButton.addEventListener('click', (e) => {
    const trimmedWord1 = word1.value.trim()
    const trimmedWord2 = word2.value.trim()
    console.log(trimmedWord2)
    if (trimmedWord2.length > 0) {
      chrome.runtime.sendMessage(
        {
          message: 'open_diffs',
          payload: { word1: trimmedWord1, word2: trimmedWord2 },
        },
        (response) => {
          if (response.message === 'success') {
            addHistory('diff', trimmedWord1, trimmedWord2)
          }
        }
      )
    }
  })

  const optionLink = document.createElement('div')
  optionLink.id = 'optionLink'
  optionLink.onclick = () => {
    chrome.runtime.sendMessage({ message: 'open_options' })
  }
  optionLink.innerHTML = 'オプション設定 >>'

  pupBox.appendChild(labelW1)
  pupBox.appendChild(labelW2)
  labelW1.appendChild(word1)
  labelW1.appendChild(dictButton)
  labelW2.appendChild(word2)
  labelW2.appendChild(diffButton)
  pupBox.appendChild(optionLink)
  document.body.appendChild(pupBox)
})

// close word
document.addEventListener('click', (e) => {
  if (
    e.target.id !== 'pupBox' &&
    e.target.id !== 'word1' &&
    e.target.id !== 'word2' &&
    e.target.id !== 'dictButton' &&
    e.target.id !== 'diffButton' &&
    e.target.id !== 'optionLink'
  ) {
    document.querySelectorAll('#pupBox').forEach((node) => {
      node.remove()
    })
  }
})
