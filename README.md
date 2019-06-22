# Prototype Trees

The code in this repository implements a new kind of JavaScript component: the prototype tree.
 
[Prototypical inheritance](https://prototypejungle.org/doc/inherit.html) is central to JavaScript. However, in normal practice, prototype structure is missing from stored (e.g, [JSON](https://www.json.org/)) versions of objects. Prototype trees, however, 
retain prototype structure when stored. [Here](https://prototypejungle.org/persistence.html) is a technical description.

Included  in this repository is the implementation of prototype trees in general, but also as elaborated for a particular domain: 2d visual structures rendered via SVG. 

A related project, [PrototypeJungle](https://prototypejungle.org), is  an open diagramming system based on prototype trees, and constitutes a proof of concept for the technology.

A simple test harness, with examples, can be seen over at [https://prototypejungle.org/coreExamples.html](https://prototypejungle.org/coreExamples.html). This test harness illustrates direct use of the open source code; PrototypeJungle has additional capabilities.
Also, documentation can be found at the PrototypeJungle site. Sections 4 - 10  in the [coding guide](https://prototypejungle.org/doc/code.html) cover the workings of prototype trees.

If you fork this repo, have a look at the README for [/admin](../../tree/master/admin).