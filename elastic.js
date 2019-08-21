var myapp = new Vue({
    el: '#app',
    data: {
        searchText: '',
        results: [],
        totalFound: null,
    },
    methods: {
        doSearch() {
            const searchHost = 'http://localhost:9200/test/_search';
            var body;
            if (this.searchText.length !== 0) {
                body = buildQuery(this.searchText);
            } else {
                this.results = [];
                this.totalFound = null;
                return;
            }

            const app = this; // either store reference to this in variable
            // or use the bind function
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function(vm) {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.hits.hits.lenth === 0) {
                            vm.results = [];
                            vm.totalFound = 0;
                            return;
                        }
                        vm.results = parseResults(response);
                        vm.totalFound = response.hits.total.value;
                    } else {
                        console.log("Request Failed");
                    }
                }
            }.bind(xhr, this));
            

            xhr.open('POST', searchHost, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(body));
        },
        searchKeyListener: function(evt) {
            if (evt.keyCode === 83) {
                var searchIn = document.getElementById('search');
                searchIn.focus();
                searchIn.select();
            }
        }
    },
    created: function() {
        document.addEventListener('keyup', this.searchKeyListener);
    },
    destroyed: function() {
        document.removeEventListener('keyup', this.searchKeyListener);
    }
});
function buildQuery(searchTerm, returnSize = 10) {
    var body = {'size': returnSize,
                'highlight': {
                    'order': 'score',
                    'number_of_fragments': 1,
                    'fields': {'content': {}},
                    'encoder': 'html',
                    'fragment_size': 300,
                },
                '_source': ['file.filename', 'path.real',
                            'meta.title', 'meta.raw.description']
               };
    var query = {'bool': {}};
    query.bool.must = {
        'multi_match': {
            'query': searchTerm,
            'fields': ['title', 'content'],
            'fuzziness': 'AUTO'
        }
    };
    body.query = query;
    return body;
}


function parseResults(jsonResponse) {
    var results = [];
    for (var i = 0; i < jsonResponse.hits.hits.length; i++) {
        const hit = jsonResponse.hits.hits[i];
        var content = '';
        // for short input, 3 or less characters elasticsearch does not include
        // the highlighted content in the response
        if (hit.highlight) {
            content = hit.highlight.content[0];
        }
        const path = hit._source.path.real;
        const fname = hit._source.file.filename;
        const meta = hit._source.meta;
        const title  = (typeof meta !== 'undefined' ? meta.title : fname);
        results.push({'title': title,
                      'content': content,
                      'path': path,
                      'filename': fname
                     });
    }
    return results;
}
