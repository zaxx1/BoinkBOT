const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');
const readline = require('readline');
const { DateTime } = require('luxon');

class Boink {
  constructor() {
    this.headers = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language':
        'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
      'Content-Type': 'application/json',
      Origin: 'https://boink.astronomica.io',
      Referer:
        'https://boink.astronomica.io/?tgWebAppStartParam=boink376905749',
      'Sec-Ch-Ua':
        '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/115.0.0.0 Safari/537.36',
    };
  }

  log(pesan, tipe = 'success') {
    switch (tipe) {
      case 'success':
        console.log(`${colors.cyan('[ BOINKER 💩 ]')}`, `${pesan}`.green);
        break;
      case 'custom':
        console.log(`${colors.cyan('[ BOINKER 💩 ]')}`, `${pesan}`);
        break;
      case 'error':
        console.log(`${colors.cyan('[ BOINKER 💩 ]')}`, `${pesan}`.red);
        break;
      case 'warning':
        console.log(`${colors.cyan('[ BOINKER 💩 ]')}`, `${pesan}`.yellow);
        break;
      default:
        console.log(`${colors.cyan('[ BOINKER 💩 ]')}`, `${pesan}`.green);
    }
  }

  async countdown(detik) {
    for (let i = detik; i >= 0; i--) {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        `===== Semua akun selesai, tunggu ${i} detik untuk melanjutkan putaran =====`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    this.log('', 'success');
  }

  async loginByTelegram(initDataString) {
    const url =
      'https://boink.astronomica.io/public/users/loginByTelegram?p=android';
    const payload = { initDataString };
    try {
      const response = await axios.post(url, payload, {
        headers: this.headers,
      });
      if (response.status === 200) {
        return { success: true, token: response.data.token };
      } else {
        return { success: false, status: response.status };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  saveToken(userId, token) {
    let tokens = {};
    if (fs.existsSync('token.json')) {
      tokens = JSON.parse(fs.readFileSync('token.json', 'utf8'));
    }
    tokens[userId] = token;
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
  }

  getToken(userId) {
    if (fs.existsSync('token.json')) {
      const tokens = JSON.parse(fs.readFileSync('token.json', 'utf8'));
      return tokens[userId];
    }
    return null;
  }

  async getUserInfo(token) {
    const url = 'https://boink.astronomica.io/api/users/me?p=android';
    const headers = { ...this.headers, Authorization: token };
    try {
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, status: response.status };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleFriendActions(token, friendIds) {
    for (const friendId of friendIds) {
      await this.claimFriendReward(token, friendId);
      await this.pushFriendToPlay(token, friendId);
    }
  }

  extractFirstName(initDataString) {
    try {
      const decodedData = decodeURIComponent(
        initDataString.split('user=')[1].split('&')[0],
      );
      const userData = JSON.parse(decodedData);
      return userData.first_name;
    } catch (error) {
      this.log('Gagal mengambil first_name: ' + error.message, 'error');
      return 'Unknown';
    }
  }

  async upgradeBoinker(token) {
    const url =
      'https://boink.astronomica.io/api/boinkers/upgradeBoinker?p=android';
    const payload = {};
    const headers = { ...this.headers, Authorization: token };
    try {
      const response = await axios.post(url, payload, { headers });
      if (response.status === 200 && response.data) {
        const { newSoftCurrencyAmount, newSlotMachineEnergy, rank } =
          response.data;
        this.log(
          `Upgrade berhasil, Balance: ${colors.yellow(newSoftCurrencyAmount)}`,
          'success',
        );
        return { success: true };
      } else {
        this.log(
          `Upgrade gagal!`,
          'error',
        );
        return { success: false };
      }
    } catch (error) {
      this.log(`Tidak cukup emas untuk upgrade!`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Fungsi lain dilanjutkan seperti aslinya...

  async main() {
    const dataFile = path.join(__dirname, 'data.txt');
    const data = fs
      .readFileSync(dataFile, 'utf8')
      .replace(/\r/g, '')
      .split('\n')
      .filter(Boolean);

    while (true) {
      for (let i = 0; i < data.length; i++) {
        const initDataString = data[i];
        const firstName = this.extractFirstName(initDataString);

        console.log(
            `-------------------------------[ 💤💤💤 : ${firstName.green} ]-------------------------------`,
          );

        const parsedData = JSON.parse(
          decodeURIComponent(initDataString.split('user=')[1].split('&')[0]),
        );
        const userId = parsedData.id;

        let token = this.getToken(userId);
        if (!token) {
          const loginResult = await this.loginByTelegram(initDataString);
          if (loginResult.success) {
            this.log('Login berhasil!', 'success');
            token = loginResult.token;
            this.saveToken(userId, token);
          } else {
            this.log(
              `Login gagal! ${
                loginResult.status || loginResult.error
              }`,
              'error',
            );
            continue;
          }
        }

        // Lanjutan kode aslinya...
       console.log();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await this.countdown(10 * 60);
    }
  }
}

const boink = new Boink();
boink.main().catch((err) => {
  boink.log(err.message, 'error');
  process.exit(1);
});
