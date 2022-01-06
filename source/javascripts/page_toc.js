window.onload = function toc() {
    const h2List = document.querySelectorAll('h2.anchored-heading')

    const ul = document.createElement('ul');
    ul.setAttribute('style', 'list-style-type:none');
    ul.setAttribute('class', 'toc__list');

    h2List.forEach(function (h) {
        const a = document.createElement('a');
        const aText = document.createTextNode(h.innerText);
        a.append(aText);
        a.setAttribute('href', '#'+h.id);
        const li = document.createElement('li');
        li.append(a);
        ul.append(li);
    })

    const pageTOC = document.getElementById('page_toc');
    pageTOC.setAttribute('style', 'border-style:solid;border-width:1px;width:fit-content;margin-bottom:20px')

    pageTOC.append(ul)
}
