<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-layout
      style="max-width: 500px; min-height: 410px !important"
      class="bg-white"
    >
      <div class="row bg-accent">
        <div class="col-grow">
          <q-bar>
            <span class="text-h6 text-white">Details</span>
            <q-space />
            <q-btn color="white" dense flat icon="close" v-close-popup>
              <q-tooltip style="font-size: small">Close</q-tooltip>
            </q-btn>
          </q-bar>
        </div>
      </div>
      <div class="row q-pa-md">
        <div style="white-space: pre-wrap;">{{item?.description}}</div>
      </div>
    </q-layout>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { PropType  } from 'vue';
import { Item } from '../models/Item';

const props = defineProps({
  item: {
    type: Object as PropType<Item>,
    required: false,
  }
});

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();
</script>
