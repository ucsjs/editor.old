import { useUserStore } from "~/store/user.store";
import { userNavbarStore } from "~/store/navbar.store";

export default async ({ $t }) => {
    const state = useUserStore();
    const navbar = userNavbarStore();
    navbar.addItem($t("Edit"), {}, 1);
}