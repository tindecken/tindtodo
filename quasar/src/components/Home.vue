<template>
  <q-layout view="lHr lpR fFf">
    <q-header height-hint="98"> </q-header>
    <q-page-container>
      <q-page padding class="column items-center">
        <q-form class="column" @submit="onCreateItem">
          <div class="row">
            <q-input class="col-xs-8 col-sm-6 col-md-8 q-pr-sm" autocomplete="off" outlined dense v-model="title" placeholder="Title"
              lazy-rules :rules="[
                (val) => (val && val.length > 0) || 'Title is required.',
                (val) =>
                  (val && val.length <= 200) ||
                  'Title is limited to 200 characters.',
              ]">
            </q-input>
            <q-input dense outlined v-model="dueDate" class="col-sm-6 col-md-4" label="Due Date">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dueDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="row">
            <q-input class="col-12" rows="3" type="textarea" autocomplete="off" outlined dense v-model="description"
              placeholder="Description" lazy-rules :rules="[
                (val) =>
                  (val.length <= 2000) ||
                  'Descripton is limited to 2000 characters.',
              ]">
            </q-input>
          </div>
          <div class="row justify-end">
            <q-btn outline label="Create" type="submit" style="height: 40px" />
          </div>
        </q-form>

        <q-separator color="primary" class="column q-mt-md q-mb-md" style="height: 10px"/>

        <div v-for="item in items" :key="item.id" class="caption row">
          <q-card class="row post-card q-mb-md" bordered>
            <q-card-section class="q-pa-none row justify-between">
              <div class="row text-h6 q-mt-sm q-mb-sm" style="overflow-wrap: anywhere">
                {{ item.title }}
              </div>
              <div class="col-12 text-h6 q-mt-sm q-mb-sm" style="overflow-wrap: anywhere">
                {{ item.description }}
              </div>
              <div class="text-grey self-center order-last">
                {{ date.formatDate(item.createdDate, 'YYYY-MM-DD HH:mm:ss Z') }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn flat rounded icon="edit" @click="done(item)"></q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <q-footer>
      <q-toolbar>
        <q-toolbar-title>{{ $q.screen.name }}, width: {{ $q.screen.width }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { CreateItemRequest } from '../models/CreateItemRequest';
import { date } from 'quasar';
import { Item } from '../models/Item';

const title = ref('');
const description = ref('');
const dueDate = ref('');
const items: Ref<Item[]> = ref([]);
const item: Ref<Item | null> = ref(null);
onBeforeMount(async () => {
  items.value = await fetch('http://116.108.255.142:3000/items').then((res) =>
    res.json()
  );
});
var socket = new WebSocket('ws://116.108.255.142:3000/ws');
// message is received
socket.addEventListener('message', (event) => {
  console.log('message', event.data as Item);
  const itemTemp = JSON.parse(event.data) as Item;
  items.value.unshift(itemTemp);
});

// socket opened
socket.addEventListener('open', (event) => {
  console.log('open', event);
});

// socket closed
socket.addEventListener('close', (event) => {
  console.log('close', event);
});

// error handler
socket.addEventListener('error', (event) => {
  console.log('error', event);
});
async function onCreateItem() {
  const createItemRequest: CreateItemRequest = {
    title: title.value,
    description: description.value,
    dueDate: dueDate.value,
  };
  const response = await fetch('http://116.108.255.142:3000/items', {
    method: 'POST',
    body: JSON.stringify(createItemRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  items.value.unshift(data[0]);
  socket.send(JSON.stringify(data[0]));
}
async function done(item: any) {
  console.log('item', item);
}
</script>
