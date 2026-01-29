var fs = require('fs')

async function decode(path) {
    const data = fs.readFileSync(path, 'utf-8')
    const obj = JSON.parse(data)
    let count = 0
    for (var e of obj.log.entries) {
        if (e.request.url.includes('https://us1.clevertap-prod.com/a?t')) {
            const { searchParams } = new URL(e.request.url)
            const d = searchParams.get('d')
            // const gc = searchParams.get('gc')
            const decom = JSON.parse(decompressFromBase64(d))
            console.log(decom)
            // console.log('gc = ', gc)
            console.log(' ')
            count++
        }
    }
    console.log('found', count)
}

decode('./clevertapnetworkrequests.har')

function getKeyStr () {
  var key = ''
  var i = 0

  for (i = 0; i <= 25; i++) {
    key = key + String.fromCharCode(i + 65)
  }

  for (i = 0; i <= 25; i++) {
    key = key + String.fromCharCode(i + 97)
  }

  for (i = 0; i < 10; i++) {
    key = key + i
  }

  return key + '+/='
}

function decompress (compressed) {
  if (!compressed) {
    return ''
  }
  let dictionary = []
  let enlargeIn = 4
  let dictSize = 4
  let numBits = 3
  let entry = ''
  let result = ''
  let i, w, bits, resb, maxpower, power, c
  let f = String.fromCharCode
  let data = {
    string: compressed,
    val: compressed.charCodeAt(0),
    position: 32768,
    index: 1
  }

  for (i = 0; i < 3; i += 1) {
    dictionary[i] = i
  }

  bits = 0
  maxpower = Math.pow(2, 2)
  power = 1
  while (power !== maxpower) {
    resb = data.val & data.position
    data.position >>= 1
    if (data.position === 0) {
      data.position = 32768
      data.val = data.string.charCodeAt(data.index++)
    }
    bits |= (resb > 0 ? 1 : 0) * power
    power <<= 1
  }

  switch (bits) {
    case 0:
      bits = 0
      maxpower = Math.pow(2, 8)
      power = 1
      while (power !== maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position === 0) {
          data.position = 32768
          data.val = data.string.charCodeAt(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }
      c = f(bits)
      break
    case 1:
      bits = 0
      maxpower = Math.pow(2, 16)
      power = 1
      while (power !== maxpower) {
        resb = data.val & data.position
        data.position >>= 1
        if (data.position === 0) {
          data.position = 32768
          data.val = data.string.charCodeAt(data.index++)
        }
        bits |= (resb > 0 ? 1 : 0) * power
        power <<= 1
      }
      c = f(bits)
      break
    case 2:
      return ''
  }
  dictionary[3] = c
  w = result = c
  while (true) {
    if (data.index > data.string.length) {
      return ''
    }

    bits = 0
    maxpower = Math.pow(2, numBits)
    power = 1
    while (power !== maxpower) {
      resb = data.val & data.position
      data.position >>= 1
      if (data.position === 0) {
        data.position = 32768
        data.val = data.string.charCodeAt(data.index++)
      }
      bits |= (resb > 0 ? 1 : 0) * power
      power <<= 1
    }

    switch (c = bits) {
      case 0:
        bits = 0
        maxpower = Math.pow(2, 8)
        power = 1
        while (power !== maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position === 0) {
            data.position = 32768
            data.val = data.string.charCodeAt(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }

        dictionary[dictSize++] = f(bits)
        c = dictSize - 1
        enlargeIn--
        break
      case 1:
        bits = 0
        maxpower = Math.pow(2, 16)
        power = 1
        while (power !== maxpower) {
          resb = data.val & data.position
          data.position >>= 1
          if (data.position === 0) {
            data.position = 32768
            data.val = data.string.charCodeAt(data.index++)
          }
          bits |= (resb > 0 ? 1 : 0) * power
          power <<= 1
        }
        dictionary[dictSize++] = f(bits)
        c = dictSize - 1
        enlargeIn--
        break
      case 2:
        return result
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }

    if (dictionary[c]) {
      entry = dictionary[c]
    } else {
      if (c === dictSize) {
        entry = w + w.charAt(0)
      } else {
        return null
      }
    }
    result += entry

    // Add w+entry[0] to the dictionary.
    dictionary[dictSize++] = w + entry.charAt(0)
    enlargeIn--

    w = entry

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }
  }
}

function decompressFromBase64 (input) {
  let _keyStr = getKeyStr()
  if (!input) {
    // Handle Improper IO
    return ''
  }
  let output = ''
  let ol = 0
  let output_,
    chr1, chr2, chr3,
    enc1, enc2, enc3, enc4
  let i = 0
  let f = String.fromCharCode

  input = input.replace(/[^A-Za-z0-9+/=]/g, '')

  while (i < input.length) {
    var a = input.charAt(i++)
    var b = input.charAt(i++)
    var c = input.charAt(i++)
    var d = input.charAt(i++)

    enc1 = _keyStr.indexOf(a)
    enc2 = _keyStr.indexOf(b)
    enc3 = _keyStr.indexOf(c)
    enc4 = _keyStr.indexOf(d)

    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4

    if (ol % 2 === 0) {
      output_ = chr1 << 8

      if (enc3 !== 64) {
        output += f(output_ | chr2)
      }
      if (enc4 !== 64) {
        output_ = chr3 << 8
      }
    } else {
      output = output + f(output_ | chr1)
      if (enc3 !== 64) {
        output_ = chr2 << 8
      }
      if (enc4 !== 64) {
        output += f(output_ | chr3)
      }
    }
    ol += 3
  }

  return decompress(output)
}