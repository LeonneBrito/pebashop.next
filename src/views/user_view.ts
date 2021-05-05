import { User } from "@prisma/client";

export default {
  render(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  renderMany(users: User[]) {
    return users.map((user) => this.render(user));
  },
};
