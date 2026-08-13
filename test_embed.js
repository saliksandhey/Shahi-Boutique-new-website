fetch('https://www.instagram.com/p/C7oLwAgvwFw/embed')
  .then(r => r.text())
  .then(t => {
    const imgMatch = t.match(/class=\"EmbeddedMediaImage\"[^>]+src=\"([^\"]+)\"/);
    const vidMatch = t.match(/class=\"EmbeddedMediaVideo\"[^>]+src=\"([^\"]+)\"/);
    const videoUrlMatch = t.match(/video_url\":\"([^\"]+)\"/);
    console.log('Img:', imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : 'None');
    console.log('VidClass:', vidMatch ? vidMatch[1].replace(/&amp;/g, '&') : 'None');
    console.log('VidJson:', videoUrlMatch ? videoUrlMatch[1].replace(/&amp;/g, '&').replace(/\\u0026/g, '&') : 'None');
  })
  .catch(console.error);
