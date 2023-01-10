hexo.extend.filter.register('theme_inject', function (injects) {
    injects.headEnd.file('darkmode-button-script', 'source/_data/darkmode-button-script.ejs');
});