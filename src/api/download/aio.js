import axios from 'axios';

const ApiData = async (url) => {
  try {
    const response = await axios.get(`https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(url)}`);

    return {
      status: true,
      data: response.data
    };
  } catch (error) {
    return {
      status: false,
      message: error.message
    };
  }
}
