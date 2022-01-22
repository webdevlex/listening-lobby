// Replace substring in string
// params: entire string, item to replace, replacement
function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
}

//Formats all artists for the UI to display: thundercat, smino, test
function uniFormatArtistsForUi(query) {
  query = replaceAll(query, "and", ",");
  query = replaceAll(query, "&", ",");
  return query;
}
// Format apple search queries only before searching. Seperated because apple
// search restrictions are more strict
function appleFormatSearchQuery(query) {
  query = replaceAll(query, "&", "and");
  query = replaceAll(query, "’", "");
  query = replaceAll(query, "$", "");
  query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return query;
}
//Formats for cross platform searching for optimization - work in progress
function uniTrackFormatter(query) {
  query = query.toLowerCase();
  query = query.replace(/ *\([^)]*\) */g, "");
  query = query.replace(/ *\[[^)]*\] */g, "");
  query = replaceAll(query, "&", "and");
  query = replaceAll(query, "single", "");
  query = replaceAll(query, ":", "");
  query = query.split("f**k").join("fuck");
  query = query.split("n***a").join("nigga");
  query = replaceAll(query, "EP", "");
  query = replaceAll(query, "-", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  query = replaceAll(query, "$", "");
  query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return query;
}
//Formats artist to beable to work with apple/spotify api
function uniAlbumNameFormatter(query, deleteWhiteSpaces) {
  query = query.toLowerCase();
  query = query.replace(/ *\([^)]*\) */g, "");
  query = query.replace(/ *\[[^)]*\] */g, "");
  query = replaceAll(query, ":", "");
  query = replaceAll(query, "-", "");
  query = query.split(".").join(" ");
  query = query.split(",").join(" ");
  query = replaceAll(query, "&", "and");
  query = query.split("f**k").join("fuck");
  query = query.split("n***a").join("nigga");
  query = replaceAll(query, " ep", "");
  query = replaceAll(query, " version", "");
  query = replaceAll(query, " remix", "");
  query = replaceAll(query, "single", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  query = replaceAll(query, "$", "");
  query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (deleteWhiteSpaces) {
    query = replaceAll(query, " ", "");
  }
  return query;
}
//Formats artist to beable to work with apple/spotify api
function uniArtistsFormatter(query) {
  query = replaceAll(query, "&", "");
  query = replaceAll(query, "and", "");
  query = replaceAll(query, ",", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  query = replaceAll(query, "$", "");
  query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return query;
}
function uniAlbumArtistsFormatter(query) {
  const commaIndex = query.indexOf(",");
  if (commaIndex != -1) {
    query = query.substr(0, commaIndex);
  }
  const andIndex = query.indexOf("and");
  if (andIndex != -1) {
    query = query.substr(0, andIndex);
  }
  const andSymbolIndex = query.indexOf("&");
  if (andSymbolIndex != -1) {
    query = query.substr(0, andSymbolIndex);
  }
  const spaceIndex = query.indexOf(" ");
  if (spaceIndex != -1) {
    query = query.substr(0, spaceIndex);
  }
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  query = replaceAll(query, "$", "");
  query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return query;
}

module.exports = {
  uniAlbumArtistsFormatter,
  uniArtistsFormatter,
  uniAlbumNameFormatter,
  uniTrackFormatter,
  appleFormatSearchQuery,
  uniFormatArtistsForUi,
};
