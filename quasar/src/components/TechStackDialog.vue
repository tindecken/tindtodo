<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-layout
      style="max-width: 500px; min-height: 410px !important"
      class="bg-white"
    >
      <div class="row bg-accent">
        <div class="col-grow">
          <q-bar>
            <span class="text-h6 text-white">Techstack</span>
            <q-space />
            <q-btn color="white" dense flat icon="close" v-close-popup>
              <q-tooltip style="font-size: small">Close</q-tooltip>
            </q-btn>
          </q-bar>
        </div>
      </div>
      <div class="q-pa-md">
        <div class="text-subtitle1">
          Backend:
        </div>
        <ul class="q-ma-none">
          <li>BunJS</li>
          <li>Elysia</li>
          <li>Drizzle ORM</li>
          <li>Websocket</li>
        </ul>
        <div class="text-subtitle1">
          Database:
        </div>
        <ul class="q-ma-none">
          <li>SQLite</li>
        </ul>
        <div class="text-subtitle1">
          Frontend:
        </div>
        <ul class="q-ma-none">
          <li>Vuejs with Quasar Framework</li>
        </ul>
        <div class="text-subtitle1">
          CI/CD:
        </div>
        <ul class="q-ma-none">
          <li>Jenkins</li>
        </ul>
        <div class="text-subtitle1">
          SSL/TLS:
        </div>
        <ul class="q-ma-none">
          <li>Let's encrypt</li>
        </ul>
        <div class="text-subtitle1">
          Hosted on:
        </div>
        <ul class="q-ma-none">
          <li>Raspberry Pi 4</li>
        </ul>
        <div class="text-subtitle1">
          Source code:
        </div>
        <ul class="q-ma-none">
          <li><a href="https://github.com/tindecken/tindtodo/tree/master" target="_blank">Tindecken Todo Github</a></li>
        </ul>
        
      </div>
    </q-layout>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();
</script>
