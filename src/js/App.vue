<template>
    <div
        class="navbar navbar-expand-xl shadow-sm"
        v-bind:class="{
            'navbar-dark bg-pro-sidebar text-light': nightmode,
            'navbar-light bg-light': !nightmode,
        }"
    >
        <div class="d-flex flex-nowrap flex-md-grow-0 flex-grow-1">
            <a class="navbar-brand" href="#"
                ><img
                    class="img-fluid"
                    src="./../img/butze_auf_amerikakugel_740x740.png"
                    style="height: 30px"
            /></a>

            <div class="form-inline mr-2">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01"
                            >Route</label
                        >
                    </div>
                    <!-- ${this.routeSelect.outerHTML} -->
                    <select
                        class="custom-select"
                        id="inputGroupSelect01"
                    ></select>
                </div>
            </div>

            <button
                class="navbar-toggler ml-auto"
                type="button"
                data-toggle="collapse"
                data-target="#navbarsExample04"
                aria-controls="navbarsExample04"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>

        <div class="collapse navbar-collapse" id="navbarsExample04">
            <ul id="navbar" class="navbar-nav mr-auto mt-2 mt-md-0">
                <!-- const checkbox4 = checkboxElement("customCheck4", false);
                div.appendChild(checkbox4); div.appendChild(label);
                nb.appendChild(li); this.checkbox1.setAttribute("v-model",
                "labelVisible"); // this.checkbox1.setAttribute("v-on:click",
                "toggleLabelsVisible");
                this.checkbox1.setAttribute("v-on:change",
                "toggleLabelsVisible"); checkbox2.setAttribute("v-model",
                "bordersVisible"); checkbox2.setAttribute("v-on:change",
                "toggleBordersVisible"); checkbox3.setAttribute("v-model",
                "cloudsVisible"); checkbox3.setAttribute("v-on:change",
                "toggleCloudsVisible"); checkbox4.setAttribute("v-model",
                "nightMode"); checkbox4.setAttribute("v-on:change",
                "toggleNightMode"); -->
                <li class="nav-item d-flex align-items-center">
                    <div
                        class="custom-control custom-checkbox ml-md-4 mt-md-0 mt-2"
                    >
                        <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck4"
                            checked="false"
                            v-model="nightMode"
                            v-on:change="$emit('toggle-nightmode')"
                        />
                        <!-- v-on:change="toggleNightmode" -->
                        <!-- v-on:change="$emit('toggle-nightmode')" -->
                        <label class="custom-control-label" for="customCheck4"
                            >Nightmode</label
                        >
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <!-- <TodoList /> -->
</template>

<script>
// import logo from "./../img/butze_auf_amerikakugel_740x740.png";
// import BaseCheckbox from "./Checkbox";

export default {
    components: {},
    data: {
        nightMode: false,
    },
    methods: {
        toggleNightmode(val) {
            this.nightMode = !this.nightMode;
            console.log("toggled", val);
        },
    },
};
</script>
