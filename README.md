# Pyramid Hologram

<img src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Pyramid_holographic_3D_holographic_projection_phone_projector_3D_holographic_projection_3D_mobile_phone_naked_eye_3D_pyramid.jpg" alt="image of a pyramid hologram" width=400px />

[Karthikch98, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0), via Wikimedia Commons]

## What this project is about
This project is about creating the illusion of holograms. For this we use a truncated pyramid made from a nearly transparent material (like plastic CD covers) and a device with a display (e.g. smartphone or laptop). This software displays an image multiple times, each image rotated by a specific amount of degrees. You than have to place the truncated pyramid in the center of those images and et voilà, you will see (the illusion of) a hologram from every side.

## How this project works
The principal this project is based on is the [*Pepper's Ghost effect*](https://en.wikipedia.org/wiki/Pepper%27s_ghost). In short, this is a technique with which you create the illusion of a hologram with just an image source (the display of your device) and a nearly transparent flat surface tilted above it. The light of the image will then reflect on the surface. If a person looks directly on the surface, they will see the background through it and the image shown on the display, but floating in the air. If you, for example, show a person standing in front of a black background on your device, the user will only see the person. This is, because black surfaces emit nearly no light, leading to no reflection on the reflectional surface. The displayed person, on the other hand, gets reflected on the plastic pyramid and is than visible floating in the air when you look directly onto the pyramid.

## What you can do with this project
- Create a pyramid hologram with pyramids made of three and up to eight sides.
- Load multiple images at once. This way you can show a different image on each side, giving the user a different hologram depending on the viewing angle.
- Resize and move the images in their respective canvas to create perfect holograms with your pyramid.
- Calculate the values you need to create the parts to build your n-sided pyramid.

## How to use the calculator
The calculator application asks you for four things:
1) How many sides your desired pyramid has,
2) The angle by which the sides of the truncated pyramid put top down are tilted,
3) The length of the shorter side of your display (the height on widescreen displays; the width on portrait-oriented displays),
4) The side of the polygon in the middle of your display.

The calculator than outputs values with which you can cut your own trapezes to build your own pyramid. The unit of the output is not specified, it is the same unit you used to enter your values. (Please only enter numbers and not the unit itself (*cm*, *inch*...))

The application then gives you the following information:
1) The length of the top and the bottom line,
2) The vertical distance between those two lines.

If you center the two lines and put the vertical distance between them, you receive the trapeze you need for your pyramid.

## What will be added to this project in the future
- add support for gif-files
- possibility to control position and size of each image independently
- use centimeters or inches on the website to set the sizes of the squares (currently using pixels)
