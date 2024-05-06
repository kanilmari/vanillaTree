Hi, I'd like to have this vanilla JS tree to be animated so that when a node is opened, the opening of the list of its child items is animated smoothly. When opening a node, the height should increase gradually, from 0 to the full height of the list.

There's a little catch to this. The height is not automatically known beforehand. And attemtps to give it a fixed height, like 500px, will surely fail. 

However, it's still possible to animate, as jsTree is written in jQuery that, in turn, uses vanilla JS in the background. While jQuery and jsTree can be cool, they're still not an option for VanillaTree.

Speaking of jsTree and jQuery, there's a perfect example about this already in this folder:

Please open visual_example.html and see how smoothly it works. 


Please, build an animated tree in vanilla JS that looks like the example, but does it without dependencies.