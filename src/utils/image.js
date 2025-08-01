const imageToBase64 = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);

      const dataURL = canvas.toDataURL('image/png'); // o 'image/jpeg'
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });

export default imageToBase64;