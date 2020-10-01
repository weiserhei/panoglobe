<template>
    <li class="nav-item d-flex align-items-center">
        <div class="custom-control custom-checkbox ml-md-4 mt-md-0 mt-2">
            <input
                type="checkbox"
                class="custom-control-input"
                :id="id"
                v-bind:checked="checked"
                v-on:change="$emit('change', $event.target.checked)"
            />
            <label class="custom-control-label" :for="id">{{ label }}</label>
        </div>
    </li>
</template>

<script>
export default {
    mounted() {
        this.id = "vue-checkbox-" + this._uid;
    },
    data() {
        return {
            id: null,
        };
    },
    model: {
        prop: "checked",
        event: "change",
    },
    props: {
        checked: Boolean,
        label: String,
    },
};
</script>
