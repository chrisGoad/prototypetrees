# Prototype Trees

The code in this repository implements a new kind of JavaScript component: the prototype tree.
 
[Prototypical inheritance](https://protopedia.org/doc/inherit.html) is central to JavaScript. However, in normal practice, prototype structure is missing from stored (e.g, [JSON](https://www.json.org/)) versions of objects. Prototype trees, however, retain prototype structure when stored. [Here](https://medium.com/dailyjs/prototype-trees-as-javascript-components-fad6c8fb4454) is a technical description.

Included is the implementation of prototype trees in general, but also as elaborated for a particular domain: 2d visual structures rendered via SVG. 

A related project, [ProtoPedia](https://protopedia.org), is  an open diagramming system based on prototype trees, and consitututes a proof of concept for the technology.

A simple test harness, with examples, can be seen over at [https://protopedia.org/coreExamples.html](https://protopedia.org/coreExamples.html). This test harness illustrates direct use of the open source code; ProtoPedia has additional capabilities.
Also, documentation can be found at the ProtoPedia site. Sections 1 - 11  in the [coding guide](https://protopedia.org/doc/code.html) cover the workings of prototype trees.

If you fork this repo, have a look at the README for [/admin](../../tree/master/admin).