# FSSearch-vue #

A Vue.js webapp for desktop search. The files have to be indexed with FSCrawler.

This repository contains everything needed for running the search interface. For
the backend you have to install ElasticSearch and FSCrawler and afterwards index
your files. For accessing Elasticsearch you have to set the `http.cors`
configuration options to a suitable value, e.g. enable it and set `allow-origin`
to `"*"` this is, however a very bad idea if your Elastic server is reachable
from the outside (internet, untrusted network).
