/**
 * fetchModel - Веб серверээс моделийг авдаг
 *
 * @param {string} url     GET хүсэлт явуулах URL
 *
 * @returns GET хүсэлтийн хариултад ирэх JSON объектоор дүүргэсэн Promise буцаана. 
 * Өгөгдөл нь нэг объектын "data" нэртэй шинжэд байна.
 * Хэрэв хүсэлт явуулахад алдаа гарвал Promise нь дараах шинжүүдийг агуулсан объектыг буцаана.
 * {number} status          HTTP хариултын төлөв
 * {string} statusText      xhr хүсэлтээр ирсэн өгөгдөл
 */

function fetchModel(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ data });
        } catch (error) {
          reject(new Error("Invalid JSON format"));
        }
      } else {
        reject(new Error(xhr.statusText));
      }
    };
    xhr.onerror = function() {
      reject(new Error("Network error"));
    };
    xhr.send();
  });
}

export default fetchModel;
