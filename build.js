var _ = require('underscore'),
    marked = require('marked'),
    s = require('underscore.string'),
    fs = require('fs');

function rmcomments(_) {
    return _.split('\n').filter(function(l) {
        return (l.indexOf('%') !== 0);
    }).join('\n');
}

var lexed = marked.lexer(rmcomments(fs.readFileSync('README.md', 'utf8')));

var chunks = [];

var chunk = { sections: [] };
chunk.sections.links = {};
lexed.forEach(function(l) {
    if (l.type == 'heading') {
        if (!_.isEmpty(chunk)) {
            chunks.push(chunk);
            chunk = {
                sections: [
                ]
            };
            chunk.sections.links = {};
        }
        chunk.heading = l;
    } else {
        chunk.sections.push(l);
    }
});

chunks.forEach(function(c) {
    if (c.heading) {
        fs.writeFileSync('section-' + s.slugify(c.heading.text) + '.html',
            _.template(fs.readFileSync('template._', 'utf8'))({
                content: marked.parser(c.sections),
                title: 'map school: ' + c.heading.text
            }));
    }
});

var lexed = marked.lexer(rmcomments(fs.readFileSync('README.md', 'utf8')));
lexed.forEach(function(l) {
    if (l.type == 'heading') {
        l.text = '[' + l.text + '](section-' + s.slugify(l.text) + '.html)';
    }
});
var content = marked.parser(lexed);

fs.writeFileSync('index.html',
    _.template(fs.readFileSync('template._', 'utf8'))({
        content: content,
        title: 'map school'
    }));
