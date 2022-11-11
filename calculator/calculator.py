from math import pi, dist, ceil, floor
from PIL import Image, ImageDraw
from sympy import symbols, solve, sin, cos, tan, sqrt


DPI = 300


def __main__():
    a, b, height, sides = calculation()
    draw(a, b, height, sides)


def calculation():
    # USER INPUT
    sides = int(input("Give the number of sides: "))
    delta_d = float(input("Enter the climb angle of the pyramid (default: 45 degrees): ") or "45.0")
    display_short = float(input("Enter the length of the short side of your display: "))
    square = float(input("Enter the length of one side of the inner square: "))

    # CALCULATIONS
    # easy calculations
    alpha_d = 360 / sides
    alpha_r = 2 * pi / sides
    delta_r = delta_d * pi / 180
    helping_rotation = pi / 4

    # calculations for the inner circle
    r_in = square / 2
    pi1 = (r_in * cos(1*alpha_r + helping_rotation), r_in * sin(1*alpha_r + helping_rotation))
    pi2 = (r_in * cos(2*alpha_r + helping_rotation), r_in * sin(2*alpha_r + helping_rotation))
    a = dist(pi1, pi2)

    # calculations for the outer circle
    r_out = sqrt(2 * pow(display_short / 2, 2))

    # --> points for the tangents
    tp1 = (r_out * cos(1*alpha_r + helping_rotation), r_out * sin(1*alpha_r + helping_rotation))
    tp2 = (r_out * cos(2*alpha_r + helping_rotation), r_out * sin(2*alpha_r + helping_rotation))
    
    # --> functions that describe the tangents
    x, f = symbols('x f')
    tangent = -1/tan(f*alpha_r + helping_rotation) * x + r_out * ((sin(f*alpha_r + helping_rotation)**2 + cos(f*alpha_r + helping_rotation)**2) / sin(f*alpha_r + helping_rotation))

    t1 = tangent.subs(f, 1)
    t2 = tangent.subs(f, 2)
    t3 = tangent.subs(f, 3)

    x1, x2 = solve(t1-t2, x)[0], solve(t2-t3, x)[0]
    y1, y2 = t1.subs(x, x1).evalf(), t2.subs(x, x2).evalf()
    po1, po2 = (x1, y1), (x2, y2)

    b = dist(po1, po2)

    # calculate the height of the trapeze
    beta_d = (180 - alpha_d) / 2
    gamma_d = 90 - beta_d
    gamma_r = gamma_d * pi / 180

    d = (b - a) / 2

    h = d / tan(gamma_r)
    h_tilted = h / cos(delta_r)

    print(f'{h_tilted=}, {a=}, {b=}')

    # return the results
    return a, b, h_tilted, sides


def cm_to_px(cm):
    return (DPI * cm) / 2.54


def concat_images(image: Image, count: int):
    img_w, img_h = image.size
    border = ceil(cm_to_px(2))  # border of the page (2 cm)
    page_w, page_h = floor(cm_to_px(21)), floor(cm_to_px(29.7))
    page_size_w_inch, page_h_inch = page_w / 2.54, page_h / 2.54
    content_w, content_h = page_w - 2*border, page_h - 2*border

    horizontal_per_page, vertical_per_page = floor(content_w / img_w), floor(content_h / img_h)

    if horizontal_per_page == 0:
        horizontal_per_page = 1
    if vertical_per_page == 0:
        vertical_per_page = 1

    images_per_page = horizontal_per_page * vertical_per_page
    pages_count = ceil(count / images_per_page)

    

    pages = [Image.new('1', (page_w, page_h), 1) for i in range(0, pages_count)]

    images_printed = 0
    stop = False

    for p in range(0, len(pages)):
        page = pages[p]

        for y in range(0, vertical_per_page):
            if stop:
                break

            for x in range(0, horizontal_per_page):
                page.paste(image, (border + x * img_w, border + y * img_h))

                images_printed += 1

                if images_printed == count:
                    stop = True
                    break

        page.save(f'all_trapezes_p{p}.pdf', resolution=DPI)


def draw(a: float, b: float, height: float, sides: int):
    delta = (b - a) / 2
    border = 5

    a, b, delta, height = cm_to_px(a), cm_to_px(b), cm_to_px(delta), cm_to_px(height)

    image = Image.new('1', (ceil(b + 2*border), ceil(height + 2*border)), 1)
    drawer = ImageDraw.Draw(image)

    # draw a single trapeze
    drawer.line([
        (delta + border, border),
        (a + delta + border, border),
        (b + border, height + border),
        (border, height + border),
        (delta + border, border)
    ])

    # save the image
    image.save('single_trapeze.png')
    concat_images(image, sides)


if __name__ == '__main__':
    __main__()
