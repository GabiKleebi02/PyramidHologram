import math


def __main__():
    # amount of sides of the polygon : user input
    sides = int(input("Give the number of sides: "))

    # calculations of inner angles
    interior_angle_sum_d = (sides - 2) * 180
    single_interior_angle_d = interior_angle_sum_d / sides

    alpha_d = beta_d = single_interior_angle_d / (sides - 2)
    alpha_r = beta_r = alpha_d * math.pi / 180

    delta_d = 45
    delta_r = delta_d * math.pi / 180

    # height of a trapeze : user input
    x = float(input("Give the height of the trapezes: "))

    # calculations for the other sides
    y = math.tan(beta_r) * x
    z = math.sqrt(math.pow(x, 2) + math.pow(y, 2))

    # length of the smallest side of the trapeze : user input
    small_side = float(input("Give the length of the smaller side: "))
    long_side = small_side + 2 * y

    # calculations of all trapezes leighed next to each other
    length_top = math.floor(sides/2) * small_side + math.ceil(sides/2) * long_side
    length_bottom = math.ceil(sides/2) * small_side + math.floor(sides/2) * long_side
    total_length = length_top + y

    # output the important values
    print()
    print("----- THE RESULTS -----")

    print(f"length of top line: {length_top} units of length; length of bottom line: {length_bottom} units of length")
    print(f"control: {small_side=}, {long_side=}")
    print(f"offset between the two lines in height: {x} units of length")
    print(f"offset between the two lines in their direction: {y} units of length")
    print(f"angle for the lines connecting the top and bottom line: {beta_d} degrees")
    print(f"So the size of your material should be {total_length} x {x} units of length")


if __name__ == "__main__":
    __main__()