/**
 *
 * @param {URL} url
 * @returns True or False
 *
 */
function isYoutubeURL(url) {
  var regex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
  if (url.match(regex)) {
    return true
  }
  return false
}

module.exports = {
  isYoutubeURL,
}
